#!/bin/bash
### Set Language
TEXTDOMAIN=virtualhost

### Set default parameters
domain=$1
owner=$(who am i | awk '{print $1}')
sitesEnable='/etc/nginx/sites-enabled/'
sitesAvailable='/etc/nginx/sites-available/'
domainDir='/var/www/'


	### check whether domain already exists
if ! [ -e $sitesAvailable$domain ]; then
	echo -e $"This domain dont exists.\nPlease Try Another one"
	exit;
else
	### Delete domain in /etc/hosts
	newhost=${domain//./\\.}
	sed -i "/$newhost/d" /etc/hosts
	### disable website
	rm $sitesEnable$domain
	### restart Nginx
	service nginx restart
	### Delete virtual host rules files
	rm $sitesAvailable$domain
fi
### check if directory exists or not
if [ -d $domainDir$rootDir ]; then
	echo -e $"Delete host root directory ? (s/n)"
	read deldir
	if [ "$deldir" == 's' -o "$deldir" == 'S' ]; then
	### Delete the directory
		rm -rf $domainDir$rootDir
		echo -e $"Directory deleted"
	else
		echo -e $"Host directory conserved"
	fi
else
	echo -e $"Host directory not found. Ignored"
fi
	### show the finished message
echo -e $"Complete!\nYou just removed Virtual Host $domain"
exit 0;
