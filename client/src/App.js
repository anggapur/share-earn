import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/home/Home";
import CreatePost from "./components/createPost/CreatePost";
import Campaign from './components/campaign/Campaign'
import Post from "./components/post/Post";
import Paywall from "./components/paywall/Paywall";
import MyCampaign from "./components/myCampaign/MyCampaign";
import MyReward from "./components/myReward/MyReward";
import { useEffect, useState } from "react";
import Axios from "axios";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faPlus } from '@fortawesome/free-solid-svg-icons';
import config from './config/config'
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';

function App() {
  const [user, setUser] = useState(null);  
  let navigate = useNavigate();

  useEffect(() => {

    const setLocalStorage = (res) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.id);
      setUser(res.data.id)
    }

    const unsetLocalStorage = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user_id')
      setUser(null)
    }

    Axios({
      method: "GET",
      withCredentials: true,
      url: `${config.SERVER_URL}/user`,
    }).then((res) => {
      res.data.id ? setLocalStorage(res) : unsetLocalStorage();      
    })
  })

  const navigateCreateCampaign = () => {
    console.log('NATIGATE')
    navigate("/create");
  };

  const navigateMyCampaigns = () => {
    navigate("/campaigns");
  };

  const navigateMyRewards = () => {
    navigate("/rewards");
  };

  const navigateLogin = () => {
    window.location.replace(`${config.SERVER_URL}/login`)
  };

  const navigateLogout = () => {
    Axios({
      method: "GET",
      withCredentials: true,
      url: `${config.SERVER_URL}/logout`,
    }).then((res) => {
      setUser(null);
      console.log(res);
    })
  }

  const cutPublisher = (inputString) => {
    const len = 6
    const firstFourChars = inputString.substring(0, len);
    const lastFourChars = inputString.substring(inputString.length - len);
    return firstFourChars+"..."+lastFourChars
  }

  return (
    <div>      
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand onClick={() => {navigate("/")}}><h2>SharEarn</h2></Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">         
          <Nav className="justify-content-end flex-grow-1 pe-3">
            { user === null ? (
              <>
               <Nav.Link onClick={navigateLogin}> <FontAwesomeIcon icon={faRightFromBracket}/>   Login</Nav.Link> 
              </>
            ) : (
              <NavDropdown title={"Signed in as: "+cutPublisher(user)} id="basic-nav-dropdown">              
              <NavDropdown.Item onClick={navigateMyCampaigns}>
                My Campaigns
              </NavDropdown.Item>
              <NavDropdown.Item onClick={navigateMyRewards}>
                My Rewards
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={navigateLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
            )}
            
            </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
      {/* Login Float Button */}
      { user !== null ? (<Button variant="success" className="btn-float"><FontAwesomeIcon icon={faPlus} onClick={navigateCreateCampaign}/> </Button>) : <></>}    
      
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/post/:postId" element={<Post />} />
        <Route path="/paywall" element={<Paywall />} />

        <Route path="/create" element={<CreatePost />} />        
        <Route path="/campaigns" element={<Campaign />} />
        <Route path="/rewards" element={<MyReward />} />          

        <Route path="/users/campaign/:campaignId" element={<MyCampaign />} />
      </Routes>
    </div>
  );
}

export default App;
