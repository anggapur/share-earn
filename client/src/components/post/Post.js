import "./Post.css";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import React from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink , faMoneyBill, faUser, faChain, faCheck} from '@fortawesome/free-solid-svg-icons';
import clipboardCopy from 'clipboard-copy';
import config from '../../config/config'

function Post() {  
  const { state } = useLocation();  
  const [isCopied, setIsCopied] = useState(false);
  const [url, setUrl] = useState(null);

  const getURL = async () => {
    console.log('GET URL CLick')
    const token = localStorage.getItem('token');        
    await fetch(`${config.SERVER_URL}/api/v1/campaigns/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
        'Authorization': token
        // You can add additional headers here if needed
      },
      body: JSON.stringify({
        campaignId: state.post.id
      }) // Convert the data object to JSON string
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parse the response JSON (if the response is in JSON format)
    })
    .then(responseData => {
      // Handle the successful response data here          
      setUrl(responseData.data.urlHash)
      clipboardCopy(responseData.data.urlHash);
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('POST request failed:', error);
    });      
  };          

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

    const handleCopy = () => {
      if (url === null) {
        getURL()      
      }      
      setIsCopied(true);

      setTimeout(function() {
        setIsCopied(false)
      }, 2000);
    };
  
    return (
      <div className="postPage">
      <Container>
        <Row>   
        <Col xs lg="4">
          <Card cla>
            <Card.Img variant="top" src={thumbnail === "" || thumbnail == null ? "https://static.vecteezy.com/system/resources/thumbnails/005/048/106/small/black-and-yellow-grunge-modern-thumbnail-background-free-vector.jpg" : thumbnail} alt={title} />
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
                <button className="btn btn-secondary btn-sm btn-copy" onClick={handleCopy} disabled={ isCopied ? "disabled" : ""}>
                  <FontAwesomeIcon icon={isCopied ? faCheck : faChain} /> { isCopied ? "Copied to Clipboard" : "Copy Link URL"}
                </button>
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
