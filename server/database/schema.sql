use db_sharearn


CREATE TABLE db_sharearn.users (
	id INT auto_increment NOT NULL,
	public_key varchar(250) NOT NULL,	
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

INSERT INTO db_sharearn.users (id, public_key) 
VALUES 
(1, "03b6e1d48eb543700f98c013b1051eef6e13af044754346fd5b8442a8546d8af50"),
(2, "03b6e1d48eb543700f98c013b1051eef6e13af044754346fd5b8442a8546d8aEEE"),
(3, "03b6e1d48eb543700f98c013b1051eef6e13af044754346fd5b8442a8546d8aFFF");


CREATE TABLE db_sharearn.campaigns (
	id INT auto_increment NOT NULL,
	user_id int,
	title varchar(100),
	thumbnail varchar(100) NULL,
	description text NULL,
	original_content_url varchar(150) NULL,
	reward_per_click BIGINT default(0),
	lnurl_pay varchar(255) UNIQUE,	
	status tinyint,
	tags text,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

INSERT INTO db_sharearn.campaigns (id, user_id, title, thumbnail, description, original_content_url, reward_per_click, lnurl_pay, status, tags) 
VALUES 
(1, 1, "Campaign 1", "thumb1.png", "Description...", "https://www.w3schools.com/mysql/mysql_insert.asp", 1000, "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ7WZ6WEX5GJCZTXF8E",2, "tag1|tag2|tag3"),
(2, 1, "Campaign 2", "thumb1.png", "Description...", "https://stackoverflow.com/questions/6889065/inserting-multiple-rows-in-mysql", 500, "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ74M5DA9YYKQ9R6EJY",1, "tag5"),
(3, 1, "Campaign 3", "thumb1.png", "Description...", "https://dev.mysql.com/doc/refman/8.0/en/integer-types.html", 100, "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ7E6NDEP8VEQY64S3M",0, "tag1|tag2|tag4");


CREATE TABLE db_sharearn.top_up_rewards (
	id INT auto_increment NOT NULL,
	campaign_id int,
	bolt11 varchar(250) UNIQUE,
	ln_preimage varchar(250) UNIQUE,
	ln_payment_id varchar(250) UNIQUE NULL,
	status tinyint,
	amount BIGINT default(0),
	invoice_created BIGINT,
	invoice_settled BIGINT default(0),
	FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

INSERT INTO db_sharearn.top_up_rewards (id, campaign_id, bolt11, ln_preimage, ln_payment_id, status, amount, invoice_created, invoice_settled)
VALUES
(1,1,"lnbc12","Iih8huu","0x1", 1, 1000000000, 1681800011, 1681800012),
(2,1,"lnbc13","Iih8h111","0x2", 1, 2000000000, 1681800012, 1681800013);


CREATE TABLE db_sharearn.shareable_urls (
	id INT auto_increment NOT NULL,
	campaign_id int,
	user_id int,
	url_hash varchar(50) UNIQUE,
	FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

INSERT INTO db_sharearn.shareable_urls (id, campaign_id, user_id, url_hash)
VALUES
(1, 1, 2, "mfny623jAa"),
(2, 1, 3, "9u8HN9jhjj");


CREATE TABLE db_sharearn.click_counts (
	id INT auto_increment NOT NULL,
	shareable_url_id int,
	ip varchar(20),
	reward BIGINT default(0),
	FOREIGN KEY (shareable_url_id) REFERENCES shareable_urls(id),
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

INSERT INTO db_sharearn.click_counts (id, shareable_url_id, ip, reward) 
VALUES
(1, 1, "192.168.1.1", 1000),
(2, 1, "192.168.1.2", 1000),
(3, 1, "192.168.1.3", 1000);
	

CREATE TABLE db_sharearn.claimed_rewards (
	id INT auto_increment NOT NULL,
	user_id int,
	status tinyint,
	payment_destination_type tinyint,
	payment_destination varchar(250),
	amount BIGINT default(0),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

INSERT INTO db_sharearn.claimed_rewards (id, user_id, status, payment_destination_type, payment_destination, amount)
VALUES
(1, 2, 1, 1, "kitchenquail33@walletofsatoshi.com", 3000)

	
