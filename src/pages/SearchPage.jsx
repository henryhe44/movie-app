import React from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { SearchPageContainer } from "../components/Container";

// const Container = styled.div`
//   max-width: 1800px;
//   width: 100vw;
//   min-height: 90vh;
//   padding: 0 ${props => props.theme.fonts.xLarge};
//   box-sizing: border-box;
// `;
const SearchParams = styled.div``;
const MediaSelection = styled.select``;
const ResultWrap = styled.div`
  border-bottom: solid 1px ${props => props.theme.colors.grey};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props =>
    `${props.theme.sizes.large} ${props.theme.sizes.tiny}`};
`;
const ImageWrap = styled.div`
  width: 40%;
  margin-right: ${props => props.theme.sizes.large};
  overflow: hidden;
  align-items: center;
  justify-content: space-between;
`;
const Image = styled.img`
  width: 100%;
  transition: 0.2s ease-in-out;
  :hover {
    opacity: 0.7;
    transform: scale(1.02);
  }
`;
const Blurb = styled.div`
  width: 60%;
  font-family: Helvetica;
  font-weight: 700;
  color: white;
  position: relative;
  padding: ${props => props.theme.sizes.veryLarge};
`;
const Title = styled.h1`
  text-transform: uppercase;
  font-family: Arial;
  font-size: ${props => props.theme.fonts.xLarge};
  font-weight: 1000;
  letter-spacing: -2.5px;
  background: ${props => props.theme.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;
const MediaDate = styled.h3`
  font-size: ${props => props.theme.fonts.medium};
  padding: ${props => props.theme.sizes.small} 0px;
  margin: 0;
`;
const Rating = styled.h3`
  font-size: ${props => props.theme.sizes.medium};
  padding: 0px 0px ${props => props.theme.sizes.small} 0px;
  margin: 0;
`;
const Overview = styled.p`
  font-size: ${props => props.theme.sizes.small};
`;

const imagePath = "https://image.tmdb.org/t/p/w780";

class SearchPage extends React.Component {
  state = {
    results: []
  };

  getResults = async () => {
    const query = queryString.parse(this.props.location.search);
    const link = `https://api.themoviedb.org/3/search/${query.searchMedia}?api_key=${process.env.REACT_APP_API_KEY}&language=en-US&page=${query.page}&include_adult=false&query=${query.searchTerm}`;
    const response = await axios.get(link);
    this.setState({
      results: response.data.results,
      totalPages: response.data.total_pages
    });
    console.log(this.state);
  };

  componentDidMount() {
    this.getResults();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.getResults();
    }
  }

  handleNextPage = () => {
    const query = queryString.parse(this.props.location.search);
    const page = parseInt(query.page);
    const { totalPages } = this.state;
    if (page + 1 > totalPages) return;
    query.page = page + 1;
    const stringified = queryString.stringify(query);
    this.props.history.push(`?${stringified}`);
  };

  handleBackPage = () => {
    const query = queryString.parse(this.props.location.search);
    const page = parseInt(query.page);
    if (page === 1) return;
    query.page = page - 1;
    const stringified = queryString.stringify(query);
    this.props.history.push(`?${stringified}`);
  };

  handleSelection = e => {
    const searchMedia = e.target.value;
    const query = queryString.parse(this.props.location.search);
    query.searchMedia = searchMedia;
    query.page = 1;
    const stringified = queryString.stringify(query);
    this.props.history.push(`?${stringified}`);
  };

  render() {
    const { results } = this.state;
    return (
      <SearchPageContainer>
        <SearchParams>
          <MediaSelection
            value={this.state.searchMedia}
            onChange={this.handleSelection}
          >
            <option defaultValue value="multi">
              ALL
            </option>
            <option value="movie">MOVIES</option>
            <option value="person">PEOPLE</option>
            <option value="tv">TV SHOWS</option>
          </MediaSelection>
          <Button onClick={this.handleBackPage} label={"BACK"} />
          <Button
            onClick={this.handleNextPage}
            label={
              this.state.page === this.state.totalPages
                ? "NO MORE PAGES"
                : "FORWARD"
            }
          />
        </SearchParams>
        {results.map(result => [
          <ResultWrap key={result.id}>
            <ImageWrap>
              <Link to={
                  result.title ? "movie/" + result.id
                  : result.original_name ? "tv/" + result.id
                  : "person/" + result.id
                }
              >
                <Image
                  key={result.id + "Image"}
                  src={
                    result.backdrop_path ? imagePath + result.backdrop_path
                    : result.poster_path ?  imagePath + result.poster_path
                    : result.profile_path ?  imagePath + result.profile_path
                    : `https://via.placeholder.com/500x281/212025/FFFFFF?text=${result.title || result.name}`
                  }
                  alt={`${result.title || result.name} backdrop`}
                />
              </Link>
            </ImageWrap>
            <Blurb>
              <Title>{result.title || result.name}</Title>
              <MediaDate>
                {
                  result.release_date ? "Release Date: " + result.release_date 
                  : result.last_air_date ? "Last Aired: " + result.last_air_date
                  : ""
                }
              </MediaDate>
              <Rating>{result.vote_average ? `Rating: ${result.vote_average} / 10` : ""}</Rating>
              <Overview>{result.overview}</Overview>
            </Blurb>
          </ResultWrap>
        ])}
      </SearchPageContainer>
    );
  }
}

export default withRouter(SearchPage);
