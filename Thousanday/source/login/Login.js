import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image
} from "react-native";
const FBSDK = require('react-native-fbsdk');
const {
    LoginButton,
    AccessToken
} = FBSDK;
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

class Login extends Component {
    componentDidMount() {
        this._gSetup();
    }
    async _gSetup() {
        await GoogleSignin.hasPlayServices({ autoResolve: true });
        await GoogleSignin.configure({
            webClientId: '835652983909-6if3h222alkttk9oas3hr3tl15sq1u7m.apps.googleusercontent.com',
            offlineAccess: false
        });
        let user = await GoogleSignin.currentUserAsync();
    }
    _gSignIn() {
        GoogleSignin.signIn()
            .then((user) => {
                //https://thousanday.com/account/gMobileLogin
                fetch("http://192.168.0.13:5000/accounts/gLogin", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "token": user.idToken
                    })
                })
                .then((response) => response.json())
                .then((result) => {
                    switch(result) {
                        case 0:
                            alert("Can't get data, please try later");
                            break;
                        case 2:
                            alert("Account not exist");
                            break;
                        default:
                            this.props.processLogin(result, "google");
                    }
                });
            })
            .done();
    }
    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.logo} source={require("../../image/logo.png")} />
                <Text style={styles.title}>
                    Welcome! Please login ..
                </Text>
                <Text style={styles.notice}>
                    or Create a new account by Google or Facebook blow
                </Text>
                <View style={styles.google}>
                    <GoogleSigninButton
                        style={{width: 186, height: 38}}
                        size={GoogleSigninButton.Size.Standard}
                        color={GoogleSigninButton.Color.Dark}
                        onPress={this._gSignIn.bind(this)}
                    />
                </View>
                <Facebook facebookId={this.props.processLogin.bind(this)} />
            </View>
        )
    }
}

let Facebook = React.createClass({
    render: function() {
        return (
            <View style={styles.facebook}>
                <LoginButton
                    onLoginFinished={
                        (error, result) => {
                            if (error) {
                                alert("Login Error: " + result.error);
                            } else if (result.isCancelled) {
                                //alert("login is cancelled.");
                            } else {
                                AccessToken.getCurrentAccessToken().then(
                                    (data) => {
                                        fetch("http://192.168.0.13:5000/accounts/fLogin", {
                                            method: "POST",
                                            headers: {
                                                "Accept": "application/json",
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                "token": data.accessToken
                                            })
                                        })
                                        .then((response) => response.json())
                                        .then((result) => {
                                            switch(result) {

                                                case 0:
                                                    alert("Can't get data, please try later");
                                                    break;
                                                case 2:
                                                    alert("Account not exist");
                                                    break;
                                                default:
                                                    this.props.facebookId(result);
                                            }
                                        });
                                    }
                                )
                            }
                        }
                    }
                />
            </View>
        );
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 10,
        alignItems: "center"
    },
    logo: {
        marginTop: 50,
        width: 50,
        height: 50,
    },
    title: {
        marginVertical: 10,
        fontSize: 20,
        fontWeight: "bold"
    },
    notice: {
        fontSize: 14
    },
    google: {
        marginTop: 20
    },
    facebook: {
        marginVertical: 15
    }
});

export default Login;