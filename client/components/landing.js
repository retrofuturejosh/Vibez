import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import history from "../history";
import querystring from "querystring";

import {
  tagOptionsThunk,
  setTrackThunk,
  getUser,
  getSpotifyTokens
} from "../store";

export class Landing extends Component {
  constructor() {
    super();
  }

  render(props) {
    let parsedQuery = querystring.parse(this.props.location.hash.slice(1));
    parsedQuery.access_token
      ? this.props.handleUserInfo(
          parsedQuery.access_token,
          parsedQuery.refresh_token,
          parsedQuery.id,
          parsedQuery.name
        )
      : null;
    return (
      <div id="landing-window" style={{ height: "80vh" }}>
        {parsedQuery.name ? (
          <div className="greeting">Hi, {parsedQuery.name}!</div>
        ) : null}
        <div>
          <form className="form" onSubmit={e => this.props.handleSubmit(e)}>
            <div className="line">
              <h3 id="pick-song">What song best fits the vibe you want?</h3>
              song: <input className="input" type="text" name="song" />
            </div>
            <div className="line">
              artist: <input type="text" className="input" name="artist" />
            </div>
            <div className="button-holder">
              <button id="entersong" type="submit">
                VIBE
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const mapState = state => {
  return {
    tagOptions: state.tagOptions,
    firstview: state.firstview
  };
};

const mapDispatch = dispatch => {
  return {
    handleSubmit(evt) {
      evt.preventDefault();
      const song = evt.target.song.value;
      const artist = evt.target.artist.value;
      dispatch(setTrackThunk(artist, song));
      dispatch(tagOptionsThunk(song, artist));
      history.push("/tagoptions");
    },
    handleUserInfo(access, refresh, id, name) {
      dispatch(getUser(name));
      dispatch(
        getSpotifyTokens({ access_token: access, refresh_token: refresh, id })
      );
    }
  };
};

export default withRouter(connect(mapState, mapDispatch)(Landing));
