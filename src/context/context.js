import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";
const GithubContext = React.createContext();
const GithubProvider = ({ children }) => {
  const [githubUser, setGithhubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    console.log(`${rootUrl}/users/${user}`);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );
    if (response) {
      setGithhubUser(response.data);
    }

    if (response) {
      setGithhubUser(response.data);
      const { login, followers_url } = response.data;
      axios(`${rootUrl}/users/${login}/repos?per_page=100`).then((response) =>
        setRepos(response.data)
      );
      axios(`${followers_url}?perpage=100`).then((response) =>
        setFollowers(response.data)
      );
    } else {
      toggleError(true, "there is no user with that username");
    }
    checkRequests();
    setLoading(false);
  };
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        console.log({ remaining });
        setRequests(remaining);
        if (remaining === 0) {
          toggleError(
            true,
            "sorry ypu have exceeded your hourly rate requests"
          );
        }
      })
      .catch((err) => console.log(err));
  };
  function toggleError(show, msg) {
    setError({ show, msg });
  }
  useEffect(checkRequests, []);
  useEffect(() => {
    searchGithubUser("john-smilga");
  }, []);
  return (
    <GithubContext.Provider
      value={{
        loading,
        searchGithubUser,
        setGithhubUser,
        error,
        requests,
        githubUser,
        repos,
        followers,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
