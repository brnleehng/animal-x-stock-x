import React from 'react';
import './style.css';
import { Header } from '../Header';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import { About } from "../About";
import { Contact } from "../Contact";
import { Market } from "../Market";
import { Home } from "../Home";
import { SignUp } from "../SignUp";
import { Login } from "../Login";
import { Order } from "../Order";

import { Layout } from "../Layout";
import { ItemDetail } from '../ItemDetail';
import { Forgot } from '../Forgot';
import { Reset } from '../Reset';



function App() {
  return (
    <React.Fragment>
      <Layout className="Layout">
        <div className="App">
          <BrowserRouter>
            <Header />

            <Switch>
              <Route exact path='/' component={Home}/>
              <Route exact path='/about' component={About}/>
              <Route exact path='/contact' component={Contact}/>
              <Route exact path='/market' component={Market}/>
              <Route exact path='/signup' component={SignUp}/>
              <Route exact path='/login' component={Login}/>
              <Route exact path='/order' component={Order}/>
              <Route exact path='/itemDetail' component={ItemDetail}/>
              <Route exact path='/market' component={Order}/>              
              <Route exact path='/forgot' component={Forgot}/>
              <Route path='/reset/:token' component={Reset}/>
            </Switch>

          </BrowserRouter>
      </div>
      </Layout>
    </React.Fragment>
  );
}

export default App;
