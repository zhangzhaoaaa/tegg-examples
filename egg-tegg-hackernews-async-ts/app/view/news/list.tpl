{% extends "layout.tpl" %}
{% block title %}Top Stories - HackerNews{% endblock %}
{% block content %}
  <h2>Top Stories</h2>
  <ul class="news">
    {% for item in items %}
      <li>
        <a href="/item/{{ item.id }}">{{ item.title }}</a>
        <div class="meta">
          <span class="pill">▲ {{ item.score }}</span>
          by <a href="/user/{{ item.by }}">{{ item.by }}</a>
          at {{ item.timeText }}
          {% if item.descendants %} | {{ item.descendants }} comments{% endif %}
          {% if item.url %} | <a href="{{ item.url }}" target="_blank">source</a>{% endif %}
        </div>
      </li>
    {% endfor %}
  </ul>
  <div class="pager">
    {% if page > 1 %}<a href="/?page={{ page - 1 }}">Prev</a>{% endif %}
    <span>Page {{ page }}</span>
    {% if total > page * pageSize %}<a href="/?page={{ page + 1 }}">Next</a>{% endif %}
  </div>
{% endblock %}