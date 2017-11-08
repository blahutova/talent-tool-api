import React from 'react';
import {connect} from 'react-redux';
import * as queryActions from '../../actions/queryActions';
import PropTypes from 'prop-types';
import { Button, Panel} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import { withRouter } from 'react-router-dom';
import TermsList from './TermsList';
import AddTermPage from './AddTermPage';
import SimpleQueryForm from './SimpleQueryForm';


class QueryPage extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      query: this.props.query,
      terms: this.props.terms,
      categories: this.props.categories,
      basic_form_query: '',
      linkedin_query: '',
      saving: false,
      isEditing: false,
      basicViewOpen: false,
      expandedViewOpen: false};

    this.toggleEdit = this.toggleEdit.bind(this);
    this.getAndTerms = this.getAndTerms.bind(this);
    this.updateQueryState = this.updateQueryState.bind(this);
    this.saveQuery = this.saveQuery.bind(this);
    // this.deleteQuery = this.deleteQuery.bind(this);
  }

  componentDidMount() {
    this.props.actions.loadBasicFormOfQuery(this.props.query)
      .then(({ query }) => {
        this.setState({ basic_form_query : query });
      });

    this.props.actions.loadExpandedQueryLinkedIn(this.props.query)
      .then(({ query }) => {
          this.setState({ linkedin_query : query });
        });
  }

  toggleEdit() {
    this.setState({isEditing: !this.state.isEditing})
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.query.id != nextProps.query.id) {
      this.setState({query: nextProps.query});
    }

    this.setState({saving: false, isEditing: false});

    this.props.actions.loadBasicFormOfQuery(this.props.query)
      .then(({ query }) => {
        this.setState({ basic_form_query : query });
      });

    this.props.actions.loadExpandedQueryLinkedIn(this.props.query)
      .then(({ query }) => {
          this.setState({ linkedin_query : query });
        });
  }

  getAndTerms(){
    let selected = this.props.terms.map(term => {
      if (term.operator == "AND") {
        return term;
      }
    })
    return selected.filter(el => el != undefined)
  }

  getOrTerms(){
    let selected = this.props.terms.map(term => {
      if (term.operator == "OR") {
        return term;
      }
    })
    return selected.filter(el => el != undefined)
  }

  getNotTerms(){
    let selected = this.props.terms.map(term => {
      if (term.operator == "NOT") {
        return term;
      }
    })
    return selected.filter(el => el != undefined)
  }

  updateQueryState(event) {
    const field = event.target.name;
    const query = this.state.query;
    query[field] = event.target.value;
    return this.setState({query: query});
  }

  saveQuery(event) {
    event.preventDefault();
    this.setState({saving: true});
    this.onUpdate();
    this.props.actions.updateQuery(this.state.query);
  }

  onUpdate(){
    this.props.onQueryUpdated(this.state.query);
  }

  // deleteQuery(event) {
  //   this.props.onQueryDeleted();
  //   this.props.actions.deleteQuery(this.state.query);
  // }


  render() {
    const andTerms = this.getAndTerms();
    const orTerms = this.getOrTerms();
    const notTerms = this.getNotTerms();
    if (this.state.isEditing) {
      return (
      <div>
      <h1>Edit Query</h1>
        <SimpleQueryForm
        query={this.state.query}
        onSave={this.saveQuery}
        onChange={this.updateQueryState} />
      </div>
      )
    }
    return(
      <div>
        <h1>{this.state.query.name} <Button bsSize="small" onClick={this.toggleEdit}>Edit Query Name</Button></h1>
        <h4><b>All</b> of these categories will be in search result: </h4>
        <AddTermPage categories={this.props.categories} operator="AND" query={this.state.query} />
        <TermsList terms={andTerms} categories={this.props.categories}/>
        <h4><b>None</b> of these categories will be in search result: </h4>
        <AddTermPage categories={this.props.categories} operator="NOT" query={this.state.query} />
        <TermsList terms={notTerms} categories={this.props.categories}/>
        <h4><b>At least one</b> of these categories will be in search result: </h4>
        <AddTermPage categories={this.props.categories} operator="OR" query={this.state.query} />
        <TermsList terms={orTerms} categories={this.props.categories}/>

        <Button onClick={() => this.setState({ basicViewOpen: !this.state.basicViewOpen })}>
          View the basic form of query
        </Button>
        <Panel collapsible expanded={this.state.basicViewOpen}>
          {this.state.basic_form_query}
        </Panel>
        <Button onClick={() => this.setState({ expandedViewOpen: !this.state.expandedViewOpen })}>
          View the expanded query for LinkedIn
        </Button>
        <Panel collapsible expanded={this.state.expandedViewOpen}>
          {this.state.linkedin_query}
        </Panel>
        <Button>Search in LinkedIn</Button>
      </div>
    )
  }
}

QueryPage.propTypes = {
  query: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

function collectQueryTerms(query, terms) {
  let selected = terms.map(term => {
    if (query.id == term.query_id) {
      return term;
    }
  })
  return selected.filter(el => el != undefined)
}


function mapStateToProps(state, ownProps) {
  let query = {name: ''};
  let allTerms = state.terms;
  if (ownProps.query) {
    query = ownProps.query;
  }
  let termsOfQuery = collectQueryTerms(query,state.terms)
  return {query: query, terms: termsOfQuery, categories: state.categories};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(queryActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QueryPage));