#!/bin/bash
### Set Language
TEXTDOMAIN=virtualhost

### Set default parameters
user=$1
ip=$2
owner=$(who am i | awk '{print $1}')
sitesEnable='/etc/nginx/sites-enabled/'
sitesAvailable='/etc/nginx/sites-available/'
userDir='/var/www/'

if [ "$(whoami)" != 'root' ]; then
	echo $"You have no permission to run $0 as non-root user. Use sudo"
		exit 1;
fi

if [ -e $sitesAvailable$user ]; then
	echo -e $"This user already exists.\nPlease Try Another one"
	exit;
fi

if ! echo "server { 
	listen 80; 
 
  listen [::]:80; 
 
  server_name ${user}-kide.kitcode.io; 
 
  location / { 

                proxy_pass http://$ip:8080; 
 
                proxy_http_version 1.1; 
 
                proxy_set_header Upgrade \$http_upgrade; 
 
                proxy_set_header Connection 'upgrade'; 
 
                proxy_set_header Host \$host; 
 
                proxy_set_header X-Real-IP \$remote_addr; 
 
                proxy_set_header X-Fowarded-For \$proxy_add_x_forwarded_for; 
 
                proxy_set_header X-Fowarded-Proto \$scheme; 
 
                proxy_cache_bypass \$http_upgrade; 
  } 
 
}

server { 
 
  listen 80; 
 
  listen [::]:80; 
 
  server_name ${user}-terminal.kitcode.io; 
 
  location / { 

                proxy_pass http://$ip:9090;
                
		proxy_http_version 1.1; 
 
                proxy_set_header Upgrade \$http_upgrade; 
 
                proxy_set_header Connection 'upgrade'; 
 
                proxy_set_header Host \$host; 
 
                proxy_set_header X-Real-IP \$remote_addr; 
 
                proxy_set_header X-Fowarded-For \$proxy_add_x_forwarded_for; 
 
                proxy_set_header X-Fowarded-Proto \$scheme; 
 
                proxy_cache_bypass \$http_upgrade; 
  } 
 
}

server { 
 
  listen 80; 
 
  listen [::]:80; 
 
  server_name ${user}-app.kitcode.io; 
 
  location / { 

                proxy_pass http://$ip:80; 
 
                proxy_http_version 1.1; 
 
                proxy_set_header Upgrade \$http_upgrade; 
 
                proxy_set_header Connection 'upgrade'; 
 
                proxy_set_header Host \$host; 
 
                proxy_set_header X-Real-IP \$remote_addr; 
 
                proxy_set_header X-Fowarded-For \$proxy_add_x_forwarded_for; 
 
                proxy_set_header X-Fowarded-Proto \$scheme; 
 
                proxy_cache_bypass \$http_upgrade; 
  } 
 
}" > $sitesAvailable$user
	then
		echo -e $"There is an ERROR create $user file"
		exit;
	else
		echo -e $"\nNew Virtual Host Created\n"
fi

if ! echo "127.0.0.1	${user}-kide.kitcode.io" >> /etc/hosts
	then
		echo $"ERROR: Not able write in /etc/hosts"
		exit;
else
	echo -e $"Host added to /etc/hosts file \n"
fi
if ! echo "127.0.0.1	${user}-terminal.kitcode.io" >> /etc/hosts
	then
		echo $"ERROR: Not able write in /etc/hosts"
		exit;
else
	echo -e $"Host added to /etc/hosts file \n"
fi
if ! echo "127.0.0.1	${user}-app.kitcode.io" >> /etc/hosts
	then
		echo $"ERROR: Not able write in /etc/hosts"
		exit;
else
	echo -e $"Host added to /etc/hosts file \n"
fi


ln -s $sitesAvailable$user $sitesEnable$user
service nginx reload
echo -e $"Complete! \nYou now have a new Virtual Host \nYour new host is: http://$user \nAnd its located at $userDir$rootDir"
exit;

