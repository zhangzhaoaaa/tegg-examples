{% extends "layout.tpl" %}
{% block title %}Item #{{ id }} - HackerNews{% endblock %}
{% block content %}
  <h2>{{ title }}</h2>
  <div class="meta">
    <span class="pill">▲ {{ score }}</span>
    by <a href="/user/{{ by }}">{{ by }}</a>
    at {{ timeText }}
    {% if descendants %} | {{ descendants }} comments{% endif %}
    {% if url %} | <a href="{{ url }}" target="_blank">source</a>{% endif %}
  </div>
  {% if text %}
    <div class="post-text">{{ text | safe }}</div>
  {% endif %}
{% endblock %}