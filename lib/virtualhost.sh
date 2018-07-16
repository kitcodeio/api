#!/bin/bash
### Set Language
TEXTDOMAIN=virtualhost

### Set default parameters
domain=$1
ip=$2
owner=$(who am i | awk '{print $1}')
sitesEnable='/etc/nginx/sites-enabled/'
sitesAvailable='/etc/nginx/sites-available/'
domainDir='/var/www/'

if [ "$(whoami)" != 'root' ]; then
	echo $"You have no permission to run $0 as non-root domain. Use sudo"
		exit 1;
fi

if [ -e $sitesAvailable$domain ]; then
	echo -e $"This domain already exists.\nPlease Try Another one"
	exit;
fi

if ! echo "server { 
	listen 80; 
 
  listen [::]:80; 
 
  server_name ${domain}-kide.kitcode.io; 
 
  location / { 

                proxy_pass http://$ip:54123; 
 
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
 
  server_name ${domain}-terminal.kitcode.io; 
 
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
 
  server_name ${domain}-app.kitcode.io; 
 
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
 
}" > $sitesAvailable$domain
	then
		echo -e $"There is an ERROR create $domain file"
		exit;
	else
		echo -e $"\nNew Virtual Host Created\n"
fi

if ! echo "127.0.0.1	${domain}-kide.kitcode.io" >> /etc/hosts
	then
		echo $"ERROR: Not able write in /etc/hosts"
		exit;
else
	echo -e $"Host added to /etc/hosts file \n"
fi
if ! echo "127.0.0.1	${domain}-terminal.kitcode.io" >> /etc/hosts
	then
		echo $"ERROR: Not able write in /etc/hosts"
		exit;
else
	echo -e $"Host added to /etc/hosts file \n"
fi
if ! echo "127.0.0.1	${domain}-app.kitcode.io" >> /etc/hosts
	then
		echo $"ERROR: Not able write in /etc/hosts"
		exit;
else
	echo -e $"Host added to /etc/hosts file \n"
fi


ln -s $sitesAvailable$domain $sitesEnable$domain
service nginx reload
echo -e $"Complete! \nYou now have a new Virtual Host \nYour new host is: http://$domain \nAnd its located at $domainDir$rootDir"
exit;

