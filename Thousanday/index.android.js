import React, { Component } from "react";
import { AppRegistry, StyleSheet, View, AsyncStorage } from "react-native";
import { apiUrl } from "./js/Params.js";
import processError from "./js/processError.js";
import Watch from "./source/watch/Watch";


import Header from "./source/general/Header";
import Footer from "./source/general/Footer";
import Pet from "./source/pet/Pet";
import AddPet from "./source/pet/Add";
import User from "./source/user/User";
import Explore from "./source/explore/Explore";
import Moment from "./source/moment/Moment";
import PostMoment from "./source/moment/Post";
import EditProfile from "./source/user/Change";
import EditPet from "./source/pet/Edit";
import WatchList from "./source/watch/Private";
import Love from "./source/love/Love";
import Login from "./source/login/Login";
import Signup from "./source/login/Signup";
import Request from "./source/request/Request";
import processGallery from "./js/processGallery.js";



export default class Thousanday extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            //store current view name
            route: "watch",
            //store special id used in current view
            id: null,
            //store login user id
            userId: null,
            //store login user id platform
            userPlatform: null,
            //store login user token
            userToken: null,


            
            //store data for current view
            data: null,
            //show refresh animation or not
            refresh: true,
            //allow load more moment or not
            locker: false,
            //record load times,
            pin: 1,

            
            //store data show watch public image page
            watchData: [],
            //indicate how many time watch image have be reload
            watchTimes: 1,
            //indicate don't need to load watch images any more
            watchLocker: false,
            //information to show one pet
            petData: [],
            //indicate which pet data have been stored now
            petId: null,
            //information to show one user
            pageData: [],
            //indicate which user data have been stored now
            pageId: null,
            
            //store visit moment id
            momentId: null,
            //store all moment data
            momentData: [],
            //store edit pet data
            editData: [],
            //store watch list data
            privateData: [],
            //store token for signup
            signupData: null,
            //store signup platform
            signupPlatform: null,
            //store friend request data
            requestData: [],
            
        };
    }
    componentDidMount() {
        this._loadUserData().done();
    }
    //get stored user id
    async _loadUserData() {
        let userId = await AsyncStorage.getItem( "USER_KEY" );
        let platform = await AsyncStorage.getItem( "Platform_KEY" );
        let token = await AsyncStorage.getItem( "Token_KEY" );
        if ( userId != null ) {
            this.setState({
                userId: parseInt( userId ), userPlatform: platform, userToken: token
            });
        }
    }
    //change to desired view if user click on footer
    changeView( view ) {
        if ( this.state.route != view ) {
            if ( view === "postMoment" && !this.state.userId ) {
                //require login
                this.setState({ route: "home" });
            } else if (view === "love" && !this.state.userId) {
                //require login
                this.setState({ route: "home" });
            } else {
                this.setState({ route: view });
            }
        }
    }
    //enter into one moment's view
    clickMoment( id ) {
        this.setState({ route: "moment", id: id });
    }
    //enter into one pet's view
    clickPet( id ) {
        this.setState({ route: "pet", id: id });
    }
    //enter into one user's view
    clickUser( id ) {
        if ( this.state.userId && this.state.userId === id ) {
            //enter into current user's own view
            this.setState({ route: "home", id: id });
        } else {
            //enter into other user's view
            this.setState({ route: "user", id: id });
        }
    }
    //enter into one user's view and update login user's info
    goHome( user, platform ) {
        this.setState({
            userId: parseInt( user[ 0 ] ), userToken: user[ 2 ], 
            userPlatform: platform, route: "home", id: parseInt( user[ 0 ] )
        });
    }
    //logout current user
    userLogout() {
        this._removeUser().done();
        this.setState({
            userId: null, userToken: null, userPlatform: null, route: "watch"
        });
    }
    //remove user data
    async _removeUser() {
        await AsyncStorage.removeItem( "USER_KEY" );
        await AsyncStorage.removeItem( "Platform_KEY" );
        await AsyncStorage.removeItem( "Token_KEY" );
    }





   
    //if user click on add pet
    clickAddPet() {
        this.setState({route: "addPet"});
    }
    //if user click on post moment
    clickPostMoment() {
        this.setState({route: "postMoment"});
    }
    
    
    //refresh user's data
    refreshUser() {
        this.setState({userData: null, route: "home", petId: null});
    }
    //empty user data
    emptyUser() {
        this.setState({userData: null, petId: null});
    }
    //empty pet data
    refreshPet() {
        this.setState({petId: null});
    }
    //refresh user,moment, pet data, and go to new moment
    refreshMoment(id) {
        fetch(apiUrl + "/moment/read?id=" + id, {
            method: "GET",
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                processError(response);
            }
        })
        .then((moment) => {
            this.setState({route: "moment", userData: null, petId: null, momentData: moment, momentId: id});
        });
    }
    //click edit profile page
    clickEditProfile() {
        this.setState({route: "editProfile"});
    }
    //click edit pet, get info for one pet
    clickEditPet(id) {
        fetch(apiUrl + "/edit/read?pet=" + id + "&user=" + this.state.userId, {
            method: "GET",
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                processError(response);
            }
        })
        .then((pet) => {
            this.setState({editData: pet, route: "editPet"});
        });
    }
    //click watch lists,get watch list info
    clickWatchList() {
        fetch(apiUrl + "/watch/read?id=" + this.state.userId, {
            method: "GET",
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                processError(response);
            }
        })
        .then((list) => {
            this.setState({privateData: list[2], route: "watchList"});
        });
    }
    //signup feature
    goSignup(data, platform) {
        this.setState({signupData: data, signupPlatform: platform, route: "signup"});
    }
    //new user login
    newUser(result, platform) {
        if (platform === "google") {
            this._setUserData(result, "google");
            this.setState({userId: result[0], userToken: result[1], userData: null, userPlatform: "google", route: "home"});
        } else {
            this._setUserData(result, "facebook");
            this.setState({userId: result[0], userToken: result[1], userData: null, userPlatform: "facebook", route: "home"});
        }
    }
    //click friend request button
    clickRequestMessage() {
        fetch(apiUrl + "/request/read?id=" + this.state.userId, {
            method: "GET",
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                processError(response);
            }
        })
        .then((list) => {
            this.setState({requestData: list, route: "requestMessage"});
        });
    }




    render() {
        //view route system
        let route;
        switch ( this.state.route ) {
            //default view, watch public images
            case "watch":
                route=<Watch clickMoment={ this.clickMoment.bind( this ) } />;
                break;
            //moment view, show one moment's info
            case "moment":       
                route = <Moment
                    key={ "moment" + this.state.id }
                    id={ this.state.id }
                    clickPet={ this.clickPet.bind( this ) }
                    userId={ this.state.userId }
                    userToken={ this.state.userToken }
                />
                break;
            //pet view, show one pet's info
            case "pet":
                route = <Pet
                    key={ "pet" + this.state.id }
                    id={ this.state.id }
                    clickMoment={ this.clickMoment.bind( this ) }
                    clickPet={ this.clickPet.bind( this ) }
                    clickUser={ this.clickUser.bind( this ) }
                    userId={ this.state.userId }
                    userToken={ this.state.userToken }
                />;
                break;
            //user view, show other user's info
            case "user":
                route = <User
                    key={ "user" + this.state.id }
                    id={ this.state.id }
                    userId={ this.state.userId }
                    userToken={ this.state.userToken }
                    clickMoment={ this.clickMoment.bind( this ) }
                    clickPet={ this.clickPet.bind( this ) }
                    clickUser={ this.clickUser.bind( this ) }
                />;
                break;
            //home view, show login user's info
            case "home":
                if ( this.state.userId ) {
                    route = <User
                        //ref="user"
                        key={ "user" + this.state.userId }
                        id={ this.state.userId }
                        userId={ this.state.userId }
                        userToken={ this.state.userToken }
                        platform={ this.state.userPlatform }
                        clickMoment={ this.clickMoment.bind( this ) }
                        clickPet={ this.clickPet.bind( this ) }
                        clickUser={ this.clickUser.bind( this ) }
                        userLogout={ this.userLogout.bind( this ) }
                
                        clickAddPet={this.clickAddPet.bind(this)}
                        clickPostMoment={this.clickPostMoment.bind(this)}
                        clickEditProfile={this.clickEditProfile.bind(this)}
                        clickEditPet={this.clickEditPet.bind(this)}
                        clickWatchList={this.clickWatchList.bind(this)}
                        clickRequestMessage={this.clickRequestMessage.bind(this)}
                    />;
                } else {
                    //require user login
                    route = <Login
                        goHome={ this.goHome.bind( this ) }
                        goSignup={ this.goSignup.bind( this ) }
                    />;
                }
                break;




            //explore page could be seen by public
            case "explore":
                route = <Explore clickMoment={this.clickMoment.bind(this)} />;
                break;
            case "love":
                route = <Love
                    userId={this.state.userId}
                    clickMoment={this.clickMoment.bind(this)}
                />
                break;
            case "addPet":
                route = <AddPet
                    userId={this.state.userId}
                    userToken={this.state.userToken}
                    refreshUser={this.refreshUser.bind(this)}
                />
                break;
            case "postMoment":
                if (this.state.userData) {
                    route = <PostMoment
                        petList={this.state.userData[1]}
                        userId={this.state.userId}
                        userToken={this.state.userToken}
                        refreshMoment={this.refreshMoment.bind(this)}
                    />
                } else {
                    this.processLogin([this.state.userId], this.state.userPlatform, () => {
                        route = <PostMoment
                            petList={this.state.userData[1]}
                            userId={this.state.userId}
                            userToken={this.state.userToken}
                            refreshMoment={this.refreshMoment.bind(this)}
                        />
                    });
                }
                break;
            case "editProfile":
                route = <EditProfile
                    userId={this.state.userId}
                    userName={this.state.userData[0].user_name}
                    userToken={this.state.userToken}
                    refreshUser={this.refreshUser.bind(this)}
                />
                break;
            case "editPet":
                route = <EditPet
                    data={this.state.editData}
                    userId={this.state.userId}
                    userToken={this.state.userToken}
                    refreshPet={this.refreshPet.bind(this)}
                    refreshUser={this.refreshUser.bind(this)}
                    emptyUser={this.emptyUser.bind(this)}
                />
                break;
            case "watchList":
                route = <WatchList
                    data={this.state.privateData}
                    userId={this.state.userId}
                    userToken={this.state.userToken}
                    clickPet={this.clickPet.bind(this)}
                    refreshPet={this.refreshPet.bind(this)}
                />
                break;
            case "requestMessage":
                route = <Request
                    data={this.state.requestData}
                    userId={this.state.userId}
                    userToken={this.state.userToken}
                    emptyUser={this.emptyUser.bind(this)}
                />
                break;
            case "signup":
                route = <Signup
                    data={this.state.signupData}
                    platform={this.state.signupPlatform}
                    newUser={this.newUser.bind(this)}
                />
                break;
            
        }
        return (
            <View style={styles.container}>
                <Header title={this.state.route} />
                <View style={styles.main}>
                    {route}
                </View>
                <Footer changeView={this.changeView.bind(this)} view={this.state.route} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F5FCFF"
    },
    main: {
        flex: 10,
        backgroundColor: "white"
    }
});

AppRegistry.registerComponent("Thousanday", () => Thousanday);
