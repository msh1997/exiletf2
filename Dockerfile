FROM alpine:3.7
ENV MYSQL_ROOT_PASSWORD="pass"

ADD mysql.sh .

RUN ["chmod", "+x", "./mysql.sh"]
ENTRYPOINT [ "./mysql.sh" ]