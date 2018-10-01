# Server Project

## Create a Linux Server Instance
Created via AWS Lightsail
Server Information:
Private IP: 172.26.14.176
Public IP: 54.201.96.204
SSH Port: 2200

## Connect to the Server via SSH
1. Save the default private key on my local machine and reduce permissions on the file
2. SSH by providing the private key and the default ssh port

  `ssh -i ~/.ssh/LightsailDefaultPrivateKey.pem ubuntu@35.165.237.97 -p 22`
  

## Secure the Server
1. Get list of packages with updates and update packages
  sudo apt-get update
  sudo apt-get upgrade
2. Use UFW to open 3 new ports 2200, 80 and 123
3. Modify the file `/etc/ssh/sshd_config` to change the SSH port from 22 to 2200. 
4. Also update `PermitRootLogin` to be "no"
5. Restart the SSH service

## Give Grader Access
1. Add the user 'grader'
2. Create the file /etc/sudoers.d/grader to give grader sudo access
3. Create an SSH key pair for grader using the ssh-keygen tool
4. Make an .ssh directory for the grader user and set the permissions to 700
5. Create an authorized_keys file in this directory and set the permissions to 644

## Prepare to Deploy the Web Application
Verify that the timezone is set to UTC with the command `timedatectl status | grep "Time zone"`

### Install and configure Apache
1.  `sudo apt-get install apache2`
2.  Verify Apache is running by browsing to http://35.165.237.97.xip.io/
3. Check the version of Apache that's running `curl -sI localhost|grep Server`.  We're running 2.4.18.

### Download the catalog project
1.  Install mod_wsgi and python `sudo apt-get install libapache2-mod-wsgi python-dev`
2. Install Git `sudo apt-get install git`
3. Clone the item-catalog project into the /var/www/item-catalog directory
4. Edit the catalog.py file so that the run command doesn't specify host or port and to put in the absolute path to the client_secrets.json file

### Set up a virtual environment and download project-specific dependencies
1. Download pip utility for downloading python-specific dependencies `sudo apt-get install python-pip`
2. Download virtualenv `sudo pip install virtualenv`
3. Create and activate virtual environment
  `sudo virtualenv venv`
  `source venv/bin/activate`
  `sudo chmod -R 777 venv`
4. Download python dependencies
  `sudo pip install flask sqlalchemy oauth2client httplib2 passlib requests`
5. Change the name of the application
  
### Configure WSGI
1.  Create the file /var/www/item-catalog/catalog.wsgi
  ```
  import sys
  import logging
  logging.basicConfig(stream=sys.stderr)
  sys.path.insert(0, "/var/www/item-catalog")

  from catalog import app as application
  application.secret_key = 'secret'
  ```
2. Create the Apache config file at /etc/apache2/sites-available/catalog.conf
  ```
  <VirtualHost *:80>
    ServerName 35.165.237.97.xip.io
    WSGIDaemonProcess item-catalog python-path=/var/www/item-catalog:/var/www/item-catalog/venv/lib/python2.7/site-packages
    WSGIProcessGroup item-catalog
    WSGIScriptAlias / /var/www/item-catalog/catalog.wsgi
    <Directory /var/www/item-catalog/>
        Order allow,deny
        Allow from all
    </Directory>
    Alias /static /var/www/item-catalog/static
    <Directory /var/www/item-catalog/static/>
        Order allow,deny
        Allow from all
    </Directory>
    ErrorLog ${APACHE_LOG_DIR}/error.log
    LogLevel warn
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
  ```
  3.  Enable the new site configuration `sudo a2ensite catalog.conf`
  4. Disable the default configuration `sudo a2dissite 000-default.conf`
  5. Restart Apache

Do not allow remote connections
Create a new database user named catalog that has limited permissions to your catalog application database.


Deploy the Item Catalog project.
13. Clone and setup your Item Catalog project from the Github repository you created earlier in this Nanodegree program.
14. Set it up in your server so that it functions correctly when visiting your server’s IP address in a browser. Make sure that your .git directory is not publicly accessible via a browser!

# References
http://flask.pocoo.org/docs/1.0/deploying/mod_wsgi/<p>
https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps<p>
https://www.bogotobogo.com/python/Flask/Python_Flask_HelloWorld_App_with_Apache_WSGI_Ubuntu14.php<p>
https://www.youtube.com/watch?v=wq0saslschw<p>
https://stackoverflow.com/questions/31870244/apache-webserver-and-flask-app<p>
http://terokarvinen.com/2016/deploy-flask-python3-on-apache2-ubuntu<p>
