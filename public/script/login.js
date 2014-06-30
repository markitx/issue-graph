
var description = d3.select("#text")
    .html("<b>Title: </b><br/><b>Number: </b><br/><b>Body: </b><br/><b>ID: </b><br/><b>Assignee: </b><br/><b>Milestone: </b><br/><b>Repo: </b>");


$.getJSON("orgs.json")
  .done(function (data, textStatus, jqXHR) {
    var orgs = data;
    render(orgs);
  })
  .fail();
var render = function (orgs) {
  document.getElementById('user').addEventListener("click", userClick, false);
  function userClick(){
    document.getElementById('orgdrop').disabled = "true";
    document.getElementById('publictext').disabled = "true";
  }

  document.getElementById('org').addEventListener("click", orgClick, false);
  function orgClick(){
    document.getElementById('orgdrop').disabled = null;
    document.getElementById('publictext').disabled = "true";
  }
  document.getElementById('public').addEventListener("click", pubClick, false);
  function pubClick(){
    document.getElementById('publictext').disabled = null;
    document.getElementById('orgdrop').disabled = "true";
  }

  orgs.forEach(function (org) {
    d3.select('select').append('option').append('text').text(org);
  });

};
