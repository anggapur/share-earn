import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/esm/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { useEffect, useState } from "react";
import config from '../../config/config'
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import "./MyReward.css";


function MyCampaign() { 
  const [infoReward, setInfoReward] = useState([]);
  const [urls, setUrls] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [paymentType, setPaymentType] = useState(0);
  const [paymentDestination, setPaymentDestination] = useState(0);
  const [amountInSatoshi, setAmountInSatoshi] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);
  

  useEffect(() => {
    const getInfoReward = async () => {
      const token = localStorage.getItem('token');    
      const res = await fetch(`${config.SERVER_URL}/api/v1/rewards/info`, {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
          'Authorization': token
          // You can add additional headers here if needed
        },
      });      
      const data = await res.json();
      setInfoReward(data)
    };        
    getInfoReward();

    const getUrls = async () => {
      const token = localStorage.getItem('token');    
      const res = await fetch(`${config.SERVER_URL}/api/v1/users/urls`, {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
          'Authorization': token
          // You can add additional headers here if needed
        },
      });      
      const data = await res.json();
      if(data.data.rows) {
        const urls = data.data?.rows;                     
        setUrls(urls)
      }
      
    };        
    getUrls();

    const getClaimedRewards = async () => {
      const token = localStorage.getItem('token');    
      const res = await fetch(`${config.SERVER_URL}/api/v1/rewards`, {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
          'Authorization': token
          // You can add additional headers here if needed
        },
      });      
      const data = await res.json();
      if(data.data.rows) {
        const rewards = data.data?.rows;               
        setClaimedRewards(rewards)
      }
      
    };        
    getClaimedRewards();
  }, []);

  const getStatus = (status) => {
    if(status === 0) {
      return <Badge pill bg="secondary">
        Pending
      </Badge>
    } else if (status === 1) {
      return <Badge pill bg="success">
        Success
      </Badge>
    } else {
      return "-"
    }
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleSubmit = async () => {   
    const token = localStorage.getItem('token');      

    await axios
    .request({
      method: "POST",
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',        
      },
      data: {
        paymentDestinationType: parseInt(paymentType),
        paymentDestination:paymentDestination,
        amount: amountInSatoshi
      },
      url: `${config.SERVER_URL}/api/v1/rewards/claim`,
    })
    .then(function (res) {
      console.log('RES >>>> ', res)
    })
    .catch(function (err) {      
      const res = err.response.data
      if(res.errCode === "ERR_CLAIM") {
        setError(res.message)        
      } else if (res.errCode === "ERR_INPUT_1") {
        setError("Invalid Input")     
      }
    });
    // setShow(false)
  }
  const handleShow = () => setShow(true);

  const setError = (msg) =>{
    setAlertMessage(msg)
    setAlertStatus("danger")

    setTimeout(function() {
      setAlertMessage(null)
      setAlertStatus(null)
    }, 2000);
  }

  const handleInputPaymentType = (event) => {    
    setPaymentType(event.target.value)
  };

  const handleInputPaymentDestination = (event) => {    
    setPaymentDestination(event.target.value)
  };

  const handleInputAmount = (event) => {    
    setAmountInSatoshi(event.target.value)
  };


  return (
    <div className="myCampaign">
    <Container>
      <Row>   
        <Col>
          <h1>My Rewards</h1>
        </Col>      
      </Row>
      <Row>
        <Col xs lg="3">
          <Card>            
            <Card.Body>              
              <Card.Text>
              Unclaimed Rewards
              </Card.Text>
              <Card.Title>{parseInt(infoReward.totalUnclaimedRewards)/1000} satoshis</Card.Title>
              <Button variant="primary" onClick={handleShow} className='margin-25'>Claim Rewards</Button>

              {/* Modal */}
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Claim Rewards</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form.Group controlId="formFileMultiple" className="mb-3">
                  <Form.Label>Payment Type</Form.Label>
                  <Form.Select aria-label="Default select example" onChange={handleInputPaymentType}>
                    <option value="0" selected="selected">Bolt 11</option>
                    <option value="1">LN Email</option>
                    <option value="2">LNURLP</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="formFileMultiple" className="mb-3">
                  <Form.Label>Input Destination</Form.Label>
                  <Form.Control type="text" placeholder="Invoice Bolt11/LN Email/LNURP" onChange={handleInputPaymentDestination}/>
                </Form.Group>

                <Form.Group controlId="formFileMultiple" className="mb-3">
                  <Form.Label>Amount (in satoshi)</Form.Label>
                  <Form.Control type="number" placeholder="Amount" min={0} onChange={handleInputAmount}/>
                </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="success" onClick={handleSubmit}>
                    Claim
                  </Button>
                </Modal.Footer>
              </Modal>
            </Card.Body>
            <ListGroup className="list-group-flush">
              <ListGroup.Item>Claimed Rewards : {parseInt(infoReward.totalSuccessClaims)/1000} satoshis</ListGroup.Item>              
            </ListGroup>
            <Card.Footer>
              <small className="text-muted">Pending Rewards : {parseInt(infoReward.totalPendingClaims)/1000} satoshis</small>
            </Card.Footer>
          </Card>
        </Col>
        <Col xs lg="9">
          <Card>
            <Card.Body>  
              <Card.Title>URLs</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>URL Hash</th>
                    <th>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    urls.map((el, index) => (
                      <tr key={index}>
                        <td>{index+1}</td>
                        <td>{el.campaign_title}</td>
                        <td>{el.url_hash}</td>
                        <td>{parseInt(el.total_reward)/1000} satoshis</td>
                      </tr>  
                    ))
                  }
                                
                </tbody>
              </Table>
            </Card.Body>
          </Card>


          <Card className='margin-25'>
            <Card.Body>  
              <Card.Title>Claimed Rewards</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Payment Destination</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    claimedRewards.map((el, index) => (
                      <tr key={index}>
                        <td>{index+1}</td>
                        <td>{el.payment_destination}</td>
                        <td>{getStatus(el.status)}</td>
                        <td>{parseInt(el.amount)/1000} satoshis</td>
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

    {
      alertStatus == null ? <></> : 
      <Alert variant={alertStatus} className='floating-alert'>
        {alertMessage}
      </Alert>
    }    
  </div>
  );
};
  


export default MyCampaign;
