CREATE TABLE notes (
	id char(36) not null,
	title varchar(255) not null,
	description text,
	content text,
	created datetime,
	modified datetime,
	PRIMARY KEY(id)
)ENGINE=INNODB;