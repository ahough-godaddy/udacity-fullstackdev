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
Configure the local timezone to UTC.
10. Install and configure Apache to serve a Python mod_wsgi application.

If you built your project with Python 3, you will need to install the Python 3 mod_wsgi package on your server: sudo apt-get install libapache2-mod-wsgi-py3.
11. Install and configure PostgreSQL:

Do not allow remote connections
Create a new database user named catalog that has limited permissions to your catalog application database.
12. Install git.

Deploy the Item Catalog project.
13. Clone and setup your Item Catalog project from the Github repository you created earlier in this Nanodegree program.
14. Set it up in your server so that it functions correctly when visiting your server’s IP address in a browser. Make sure that your .git directory is not publicly accessible via a browser!
