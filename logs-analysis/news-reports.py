#!/usr/bin/env python3
#
# Script to produce reports for the 'news' database
#
# Author: Anne Hough
# Date: 8 June 2018

import psycopg2


'''Try connecting to the database.'''
try:
    db = psycopg2.connect("dbname=news")
except psycopg2.Error:
    print("Error connecting to database")


# Open a cursor to perform database operations
cur = db.cursor()


# Query to get the most popular articles
print("-- The Most Popular Articles of All Time --")
cur.execute("""select a.title, count(*)::int from log l
    join articles a on regexp_replace(l.path, '.*\/', '') = a.slug
    where path <> '/'
    group by a.title
    order by count(*) desc limit 3;""")
for result in cur:
    print('"{}" -- {} views'.format(result[0], result[1]))

# Query to find the most popular authors
print("\n-- The Most Popular Authors of All Time --")
cur.execute("""select au.name, count(*)::int from log l
    join articles a on regexp_replace(l.path, '.*\/', '') = a.slug
    join authors au on au.id = a.author
    group by au.name
    order by count(*) desc;""")
for result in cur:
    print("{} -- {} views".format(result[0], result[1]))

# Identify the number of requests that returned an error response
print("\n-- Days that > 1% of Requests Resulted in an Error Response --")
cur.execute("""WITH totals AS (SELECT time::date as date, count(*)
        as totalcount
        from log
        group by time::date)
    , errors AS (select time::date as date, count(*) as errorcount
        from log where status = '404 NOT FOUND'
        group by time::date)
    SELECT  t.date, round((errorcount/totalcount::numeric),4) * 100
    FROM totals t
    INNER JOIN errors e on e.date = t.date
    WHERE (round((errorcount/totalcount::numeric),4) * 100) > 1.00;""")
for result in cur:
    print("{} -- {}% errors".format(result[0], result[1]))


# Close communication with the database
cur.close()
db.close()
