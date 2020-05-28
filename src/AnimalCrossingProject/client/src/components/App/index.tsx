import React from 'react';
import './style.css';
import Header from '../Header';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import { About } from "../About";
import { Contact } from "../Contact";
import { Home } from "../Home";
import { SignUp } from "../SignUp";
import { Login } from "../Login";
import { Order } from "../Order";

import { Layout } from "../Layout";
import { ItemDetail } from '../ItemDetail';

function App() {
  return (
    <React.Fragment>
      <Layout className="Layout">
        <div className="App">
          <Header />

          <BrowserRouter>
            <Switch>
              <Route exact path='/' component={Home}/>
              <Route exact path='/about' component={About}/>
              <Route exact path='/contact' component={Contact}/>
              <Route exact path='/items' component={About}/>
              <Route exact path='/signup' component={SignUp}/>
              <Route exact path='/login' component={Login}/>
              <Route exact path='/order' component={Order}/>
              <Route exact path='/itemDetail' component={ItemDetail}/>

            </Switch>
          </BrowserRouter>
      </div>
      </Layout>
    </React.Fragment>

  );
}

export default App;
