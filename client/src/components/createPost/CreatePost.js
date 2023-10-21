import "./CreatePost.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { InputTags } from "react-bootstrap-tagsinput";
import config from '../../config/config'
import Alert from 'react-bootstrap/Alert';
import clipboardCopy from 'clipboard-copy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChain, faCheck, faHome} from '@fortawesome/free-solid-svg-icons';
import QRCode from "react-qr-code";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [originalUrl, setOriginalUrl] = useState(false) 
  const [reward, setReward] = useState([]);
  const [tags, setTags] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);
  const [showMainBox, setShowMainBox] = useState(true) 
  const [LNURLP, setLNURLP] = useState("")   
  const [isCopied, setIsCopied] = useState(false);
  
  let navigate = useNavigate();

  const submitForm = async (event) => {
    console.log({
      title,
      description,
      originalUrl,
      reward,
      tags
    })

    event.preventDefault()

    const token = localStorage.getItem('token');        
    await fetch(`${config.SERVER_URL}/api/v1/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON if sending JSON data
        'Authorization': token
        // You can add additional headers here if needed
      },
      body: JSON.stringify({
        title,
        thumbnail: "",
        description,
        originalContentUrl: originalUrl,
        rewardPerClick: reward,
        tags
      }) // Convert the data object to JSON string
    })
    .then(async(response) => {           
      const data = await response.json()
      if(response.status >= 200 && response.status <= 299) {      
        setSuccess(data.message)
        const lnurlp = data.data.lnurlPay
        setShowMainBox(false)
        console.log('LNURLP >> ', lnurlp)
        setLNURLP(lnurlp)

      } else if(response.status >= 400 && response.status <= 599) {        
        setError(data.message)        
      } 
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('POST request failed:', error);
    });  


  }
  const uploadFileHandler = (event) => {
    console.log('E', event.target.value)
  }

  const setSuccess = (msg) =>{
    setAlertMessage(msg)
    setAlertStatus("success")

    setTimeout(function() {
      setAlertMessage(null)
      setAlertStatus(null)
    }, 2000);
  }


  const setError = (msg) =>{
    setAlertMessage(msg)
    setAlertStatus("danger")

    setTimeout(function() {
      setAlertMessage(null)
      setAlertStatus(null)
    }, 2000);
  }

  const handleCopy = () => {    
    clipboardCopy(LNURLP)
    setIsCopied(true);
    setTimeout(function() {
      setIsCopied(false)
    }, 2000);
  };




  return (
    <section>
      <Container>
        <Row>
          <Col>
            <h1 style={{marginTop:"20px"}}>Create Campaign</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card style={{marginBottom: "30px"}}>            
              <Card.Body>  
              {
                showMainBox ? (                      
                    <Form onSubmit={submitForm}>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" placeholder="title" onChange={(event) => {
                          setTitle(event.target.value)
                        }}/>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} onChange={(event) => {
                          setDescription(event.target.value)
                        }}/>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Original URL</Form.Label>
                        <Form.Control type="text" placeholder="Original URL" onChange={(event) => {
                          setOriginalUrl(event.target.value)
                        }}/>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Reward per Click (in satoshi)</Form.Label>
                        <Form.Control type="number" placeholder="Reward per Click" step={"0.01"} onChange={(event) => {
                          setReward(event.target.value)
                        }}/>
                      </Form.Group>

              
                        <Form.Group style={{width: "100%"}}>
                          <Form.Label>Tags</Form.Label>
                          <InputTags
                            style={{ width: "100%"}}
                            values={tags}
                            onTags={(value) => setTags(value.values)}
                          />                  
                        </Form.Group>
                      

                      {/*  */}

                      <Form.Group style={{width: "100%" ,marginTop: "20px"}}> 
                        <Form.Label>Thumbnail</Form.Label>
                          <Form.Control
                            type='file'
                            id='image-file'
                            label='Choose File'
                            custom
                            onChange={uploadFileHandler}
                          ></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                        {/* <Form.Check
                          required
                          label="Agree to terms and conditions"
                          feedback="You must agree before submitting."
                          feedbackType="invalid"
                        /> */}
                      </Form.Group>
                      <Button type="submit">Submit form</Button>
                      </Form>                  
                  
                ): (
                  <div className="text-center">
                    <h4>Scan or Copy this LNURL-Pay to fund your Campaign!</h4>
                    <p style={{marginBottom: "30px"}}>Your campaign will be published after fund received</p>
                    <QRCode
                      size={256}
                      style={{marginBottom: "20px"}}
                      value={LNURLP}
                      viewBox={`0 0 256 256`}
                    />                    
                    <h6 style={{marginBottom: "0px"}}>{LNURLP}</h6> <br></br>
                    <button className="btn btn-secondary btn-sm btn-copy" onClick={handleCopy} disabled={ isCopied ? "disabled" : ""}>
                      <FontAwesomeIcon icon={isCopied ? faCheck : faChain} /> { isCopied ? "Copied to Clipboard" : "Copy LNURLP"}
                    </button>
                    <button className="btn btn-success btn-sm btn-copy" onClick={() => {
                      navigate("/")
                    }}>
                      <FontAwesomeIcon icon={faHome} /> Go to Homepage
                    </button>
                  </div>
                )
              }            
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {
      alertStatus == null ? <></> : 
      <Alert variant={alertStatus} className='floating-alert'>
        {alertMessage}
      </Alert>
    }  
      </Container>
    </section>
  );
}

export default CreatePost;
