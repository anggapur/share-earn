import "./Post.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import React from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink , faMoneyBill, faUser} from '@fortawesome/free-solid-svg-icons';


function Post() {
  let navigate = useNavigate();
  const { state } = useLocation();
  const paid = localStorage.getItem("paid") || false;

  useEffect(() => {
    if (state.post.paywall === true && paid === false) {
      const paywallPost = state.post;
      navigate("/paywall", {
        state: {
          paywallPost,
        },
      });
    }
  }, [state.post, navigate, paid]);

  const ArticleDetail = ({ article }) => {
    const {
      thumbnail,
      title,
      publisher,
      description,
      reward_per_click,
      created_at,
      original_content_url,
      tags,
    } = article;    

    const cutPublisher = (inputString) => {
      const len = 15
      const firstFourChars = inputString.substring(0, len);
      const lastFourChars = inputString.substring(inputString.length - len);
      return firstFourChars+"..."+lastFourChars
    }
  
    return (
      <div className="postPage">
      <Container>
        <Row>   
        <Col xs lg="4">
          <Card>
            <Card.Img variant="top" src={thumbnail} alt={title} />
            <Card.Body>
              <Card.Title>{title}</Card.Title>
              <Card.Text className="createdAt">Created at: {created_at}</Card.Text>
              <Card.Subtitle className="mb-2 text-muted publisher"><FontAwesomeIcon icon={faUser} /> {cutPublisher(publisher)}</Card.Subtitle>              
              <Card.Text>                
                <Badge bg="secondary"> <FontAwesomeIcon icon={faMoneyBill} /> {parseInt(reward_per_click)/1000} sats/click</Badge>
              </Card.Text>                                         
              {
                tags.split('|').length > 0 ?<Card.Title className="tagTitle">Tags</Card.Title>  : ""
              }
              <div>
                {tags.split('|').map((tag, index) => (
                  <Badge key={index} variant="primary" className="mr-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs lg="8">
          <Card>
            <Card.Body>              
              <Card.Text>{description}</Card.Text>
              <Card.Text>
                <a href={original_content_url} className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon={faExternalLink} /> Go to Original Content
                </a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>      
    </div>
    );
  };

  return ArticleDetail({article: state.post})
}

export default Post;
