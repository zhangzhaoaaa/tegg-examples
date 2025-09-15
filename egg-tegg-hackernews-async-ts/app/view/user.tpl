{% extends "layout.tpl" %}
{% block title %}User {{ id }} - HackerNews{% endblock %}
{% block content %}
  <h2>User: {{ id }}</h2>
  <ul>
    <li>Created: {{ createdText }}</li>
    <li>Karma: {{ karma }}</li>
    <li>About:</li>
  </ul>
  <pre>{{ about | safe }}</pre>
{% endblock %}