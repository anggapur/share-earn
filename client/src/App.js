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
import Offcanvas from 'react-bootstrap/Offcanvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import config from './config/config'

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

  const navigateHome = () => {
    navigate("/");
  };

  // const navigateCreatePost = () => {
  //   navigate("/createpost");
  // };

  const navigateMyCampaigns = () => {
    navigate("/campaigns");
  };

  const navigateMyRewards = () => {
    navigate("/rewards");
  };

  const   navigateLogin = () => {
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
       {[ 'md' ].map((expand) => (
     <Navbar key={expand} expand={expand} className="bg-body-tertiary mb-3 nav">
          <Container fluid>
            <Navbar.Brand href="#" className="navTitle" onClick={navigateHome}>SharEarn</Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Offcanvas
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-start flex-grow-1 pe-3">
                  <Nav.Link onClick={navigateMyCampaigns}>My Campaigns</Nav.Link>
                  <Nav.Link onClick={navigateMyRewards}>My Rewards</Nav.Link>                 
                </Nav>              
              </Offcanvas.Body>
            </Navbar.Offcanvas>
            <Navbar.Collapse className="justify-content-end">

            {user == null ? ( 
              <Navbar.Text>
                <a href="#login" onClick={navigateLogin}><FontAwesomeIcon icon={faArrowRightToBracket} /> Login</a>                
                
              </Navbar.Text>
              ) : (
               <Navbar.Text>
               <span className="labelLoggedIn">Logged in as: {cutPublisher(user)} </span> <a href="#login" onClick={navigateLogout}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</a>
               </Navbar.Text>
            )}
         
        </Navbar.Collapse>
          </Container>
        </Navbar>
        ))}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createpost" element={<CreatePost />} />
        <Route path="/campaigns" element={<Campaign />} />
        <Route path="/rewards" element={<MyReward />} />
        <Route path="/post/:postId" element={<Post />} />
        <Route path="/paywall" element={<Paywall />} />

        <Route path="/users/campaign/:campaignId" element={<MyCampaign />} />
      </Routes>
    </div>
  );
}

export default App;
