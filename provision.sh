#!/usr/bin/env bash

# Use single quotes instead of double quotes to make it work with special-character passwords
PASSWORD='vagrant'

# update / upgrade
sudo apt-get update
sudo apt-get -y upgrade

# install apache 2.5 and php 7
sudo apt-get install -y apache2
sudo apt-get install -y php5

# install mysql and give password to installer
# sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password $PASSWORD"
# sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $PASSWORD"
# sudo apt-get -y install mysql-server
# sudo apt-get install php5-mysql

# install phpmyadmin and give password(s) to installer
# for simplicity I'm using the same password for mysql and phpmyadmin
# sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/dbconfig-install boolean true"
# sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/app-password-confirm password $PASSWORD"
# sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/admin-pass password $PASSWORD"
# sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/app-pass password $PASSWORD"
# sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/reconfigure-webserver multiselect apache2"
# sudo apt-get -y install phpmyadmin

# install imagemagick
sudo apt-get -y install imagemagick

# setup hosts file
VHOST=$(cat <<EOF
<VirtualHost *:80>
    DocumentRoot "/var/www/html"
    <Directory "/var/www/html">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF
)
echo "${VHOST}" > /etc/apache2/sites-available/000-default.conf

# enable mod_rewrite
sudo a2enmod rewrite
sudo a2enmod expires

# restart apache
service apache2 restart

# remove index.html
rm /var/www/html/index.html
