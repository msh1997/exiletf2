#!/bin/bash

mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE USER 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'pass';
GRANT ALL PRIVILEGES ON . TO 'user'@'%';
FLUSH PRIVILEGES;
CREATE DATABASE exiletf2;
EOF

echo "created exiletf2"