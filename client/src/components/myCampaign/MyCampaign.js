import "./MyCampaign.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import React from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink , faMoneyBill, faUser } from '@fortawesome/free-solid-svg-icons';
import Table from 'react-bootstrap/Table';
import config from '../../config/config'

function MyCampaign() {
  let navigate = useNavigate();
  const { state } = useLocation();
  const paid = localStorage.getItem("paid") || false;

  const [urlList, setUrlList] = useState([]);
  
  useEffect(() => {
    const getUrls = async () => {
      const token = localStorage.getItem('token');    
      const res = await fetch(`${config.SERVER_URL}/api/v1/users/campaign/${state.campaign.id}/urls`, {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
          'Authorization': token
          // You can add additional headers here if needed
        }      
      });
      const data = await res.json();      
      if(data.data.rows) {
        const urls = data.data?.rows;           
        setUrlList(urls);
      }
    };        
    getUrls();

  }, [state.campaign, navigate, paid]);

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
      const len = 6
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
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="margin-25">
            <Card.Body>  
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>URLs</th>
                    <th>PubKey</th>
                    <th>Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    urlList.map((el, index) => (
                      <tr key={index}>
                        <td>{index+1}</td>
                        <td>{el.url_hash}</td>
                        <td>{cutPublisher(el.public_key)}</td>
                        <td>{el.total_click_count ? el.total_click_count : 0}</td>
                      </tr>  
                    ))
                  }
                                 
                </tbody>
              </Table>
            </Card.Body>
          </Card>



        </Col>
      </Row>
      </Container>      
    </div>
    );
  };

  return ArticleDetail({article: state.campaign})
}

export default MyCampaign;
