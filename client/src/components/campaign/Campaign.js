import "./Campaign.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import config from '../../config/config'

function Campaign() {

  const [campaignList, setCampaignList] = useState([]);

  useEffect(() => {
    const getCampaigns = async () => {
      const token = localStorage.getItem('token');    
      const res = await fetch(`${config.SERVER_URL}/api/v1/users/campaigns`, {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
          'Authorization': token
          // You can add additional headers here if needed
        },
      });
      const data = await res.json();      
      if(data.data.rows) {
        const campaigns = data.data?.rows;           
        setCampaignList(campaigns);
      }
    };        
    getCampaigns();
  }, []);


  const shortDescription = (description) => {
    const maxLen = 80
    if(description.length <= maxLen) return description
    else return description.substring(0, maxLen)+"..."
  }


  let navigate = useNavigate();

  const navigateCampaign = (campaign) => {
    navigate(`/users/campaign/${campaign.id}`, {
      state: {
        campaign,
      },
    });
  };

  const ArticleCard = ({ id, thumbnail, title, description, rewards, tags, onclick }) => {    
    return (
      <Card key={id} onClick={onclick} className="pointer" style={{marginBottom: "20px"}}>
        <Card.Img variant="top" src={thumbnail === "" || thumbnail == null ? "https://static.vecteezy.com/system/resources/thumbnails/005/048/106/small/black-and-yellow-grunge-modern-thumbnail-background-free-vector.jpg" : thumbnail} alt={title} />
        <Card.Body>
          <Card.Title>{title}</Card.Title>          
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
    <div className="campaign">
      <Container>
        <Row>
          <Col xs lg="12">
            <h1 style={{marginTop: " 20px"}}>My Campaigns</h1>
          </Col>
        </Row>
        <Row>        
        {campaignList.map((post) => {        
            return <Col xs lg="4">
              {ArticleCard({ 
                id: post.id,
                thumbnail: post.thumbnail, 
                title: post.title,                 
                description: post.description, 
                rewards: post.reward_per_click, 
                tags: post.tags,
                onclick: () => navigateCampaign(post)
              })}
              </Col>
          })}
        </Row>
      </Container>      
    </div>
  );
}

export default Campaign;
