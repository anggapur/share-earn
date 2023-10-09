CREATE DATABASE db_sharearn

USE db_sharearn

CREATE TABLE db_sharearn.users (
	id INT auto_increment NOT NULL,
	public_key varchar(250) NOT NULL,
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE db_sharearn.campaigns (
	id INT auto_increment NOT NULL,
	user_id int,
	title varchar(100),
	description text NULL,
	original_content_url varchar(150) NULL,
	reward_per_click BIGINT default(0),
	lnurl_pay varchar(255),
	status tinyint,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE db_sharearn.top_up_rewards (
	id INT auto_increment NOT NULL,
	campaign_id int,
	ln_payment_id varchar(250),
	amount BIGINT default(0),
	FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
	
CREATE TABLE db_sharearn.shareable_urls (
	id INT auto_increment NOT NULL,
	campaign_id int,
	user_id int,
	url_hash varchar(50),
	FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	PRIMARY KEY (id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

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
	
CREATE TABLE db_sharearn.claimed_rewards (
	id INT auto_increment NOT NULL,
	user_id int,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	status tinyint,
	payment_destination_type tinyint,
	payment_destination varchar(250),
	amount BIGINT default(0),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)