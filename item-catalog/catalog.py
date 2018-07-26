from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response
from flask import session as login_session
app = Flask(__name__)

from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from database_setup import Base, Category, Item

import random, string
import requests
import json
import httplib2
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError


client_id = json.loads(
    open('client_secret.json', 'r').read())['web']['client_id']
client_secret = json.loads(open('client_secret.json', 'r').read())['web']['client_secret']
application_name = "Catalog Items App"
app.secret_key = client_secret

engine = create_engine('sqlite:///catalog.db', connect_args={'check_same_thread': False})
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()



@app.before_first_request
def clearSession(): 
	login_session.clear()

@app.route('/catalog/<string:category_name>/catalog.json')
def catalogItemsJSON(category_name):
	#Endpoint to request serialized Item information
	items = session.query(Item).filter_by(category_name = category_name).all()

	return jsonify(Item=[i.serialize for i in items])



@app.route('/')
@app.route('/catalog/')
def catalogCategories():
	#Show categories and list of latest added items
	latest_items = session.query(Item).order_by(desc(Item.date_added)).limit(5).all()

	return render_template('index.html', latest_items=latest_items)


@app.route('/catalog/<string:category_name>/')
def getCategoryItems(category_name):
    #Get and display all of the items in the specified category
	print("Searching for category %s"  % (category_name)) 
	category = session.query(Category).filter_by(name = category_name).one()
	items = session.query(Item).filter_by(category_name = category_name).all()

	return render_template('category_description.html', category=category, items=items)




@app.route('/catalog/<string:category_name>/new/', methods=['GET','POST'])
def newItem(category_name):
    #On GET request display a form for users to add new items
    if request.method == 'GET':
        categories = session.query(Category).all()
        return render_template('add.html', category_name=category_name, categories=categories)

    #On POST request/form submit, save the new Item information to the database
    if request.method == 'POST':
        description = request.form['description']
        name = request.form['name']
        category_name = request.form['catname']
        created_by_user = login_session['gplus_id']
        print 'Adding new item: %s', name

        #If an Item name wasn't provided, don't create the item
        if name:
            new_item = Item(name = name, description = description, category_name = category_name, created_by_user = created_by_user)
            session.add(new_item)
            session.commit()

            #After creating item redirect to the Category page so the user can see the item that they just added
            return redirect(url_for('getCategoryItems', category_name=category_name))  


@app.route('/catalog/<string:category_name>/<string:item_id>/edit', methods = ['GET', 'POST'])
def editItem(category_name, item_id):
    category = session.query(Category).filter_by(name = category_name).one()
    item = session.query(Item).filter_by(id = item_id).one()

    #On GET request display a form for users to edit an existing item
    if request.method == 'GET':
        return render_template('edit.html', category=category, item=item)

    #On POST request/form submit, update the Item information in the database
    elif request.method == 'POST':
        description = request.form['description']
        name = request.form['name']
        print 'Updated Item information for: %s', name

        if item != []:
            item.description = description
            item.name = name
            session.add(item)
            session.commit()

        #After updating an item redirect to the Category page so the user can see the updated information
        return redirect(url_for('getCategoryItems', category_name=category_name))    
	

@app.route('/catalog/<string:category_name>/<string:item_id>/delete')
def deleteItem(category_name, item_id):
    #Delete an item fromt he database
    item = session.query(Item).filter_by(id = item_id).one()
    if item != []:
        session.delete(item)
        session.commit()
	return redirect(url_for('getCategoryItems', category_name=category_name)) 
	


@app.route('/login/', methods = ['GET','POST'])
def login():
    #Display the login page passing in state and google client id
	state = ''.join(random.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
	login_session['state'] = state
	
	return render_template('login.html', state=state, client_id=client_id)

@app.route('/catalog/logout/')
def logout():
    # Log out the user and clear the session
    access_token = login_session.get('access_token')
    if access_token is None:
        print 'Access Token is None'
        response = make_response(json.dumps('Current user not connected.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    #Revoke the one-time use token so user is no longer authenticated
    url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % login_session['access_token']
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]
    

    if result['status'] == '200':
        login_session.clear()
    else:
        response = make_response(json.dumps('Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        return response
    
    return redirect(url_for('catalogCategories'))


@app.route('/gconnect', methods=['POST'])
def gconnect():
    # Get an authorization code and then swap it for credentials
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    code = request.data

    try:
        oauth_flow = flow_from_clientsecrets('client_secret.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid with error handling
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != client_id:
        response = make_response(
            json.dumps("Client IDs do not match"), 401)
        print "Token's client ID does not match app's."
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(json.dumps('Current user is already connected.'),
                                 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id
    print 'Logged in as user %s', login_session['gplus_id']

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['username'] = data['name']
    login_session['email'] = data['email']

    return redirect(url_for('catalogCategories'))



if __name__ == '__main__':
	app.debug = True
	app.run(host = '0.0.0.0', port = 5000)