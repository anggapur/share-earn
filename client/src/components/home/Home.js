import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import config from '../../config/config'

function Home() {
  const [postList, setPostList] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      const res = await fetch(`${config.SERVER_URL}/api/v1/campaigns?perPage=40`);
      const data = await res.json();
      const posts = data.data.rows;      
      setPostList(posts);
    };        
    getPosts();
  }, []);

  let navigate = useNavigate();

  const navigatePost = (post) => {
    navigate(`/post/${post.id}`, {
      state: {
        post,
      },
    });
  };

  const shortDescription = (description) => {
    const maxLen = 80
    if(description.length <= maxLen) return description
    else return description.substring(0, maxLen)+"..."
  }

  const cutPublisher = (inputString) => {
    const len = 6
    const firstFourChars = inputString.substring(0, len);
    const lastFourChars = inputString.substring(inputString.length - len);
    return firstFourChars+"..."+lastFourChars
  }

  const ArticleCard = ({ id, thumbnail, title, publisher, description, rewards, tags, onclick }) => {    
    return (
      <Card key={id} onClick={onclick} className="pointer">
        <Card.Img variant="top" src={thumbnail === "" || thumbnail == null ? "https://static.vecteezy.com/system/resources/thumbnails/005/048/106/small/black-and-yellow-grunge-modern-thumbnail-background-free-vector.jpg" : thumbnail} alt={title} />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">Published by: {cutPublisher(publisher)}</Card.Subtitle>
          <Card.Text>{shortDescription(description)}</Card.Text>
          <Card.Text>
            <Badge bg="secondary">
              {parseInt(rewards)/1000} sat/click
            </Badge>
          </Card.Text>
          <div>
            {tags.split('|').map((tag, index) => (
              <Badge key={id+"-"+index} variant="primary" className="mr-1">
                {tag}
              </Badge>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  };
  

  return (
    <div className="homePage">
      <Container>
        <Row>        
          {postList.map((post) => {        
            return <Col xs lg="3" style={{marginBottom: "15px"}}>
              {ArticleCard({ 
                id: post.id,
                thumbnail: post.thumbnail, 
                title: post.title, 
                publisher: post.publisher, 
                description: post.description, 
                rewards: post.reward_per_click, 
                tags: post.tags,
                onclick: () => navigatePost(post)
              })}
              </Col>
          })}
        </Row>
      </Container>      
    </div>
  );
}

export default Home;