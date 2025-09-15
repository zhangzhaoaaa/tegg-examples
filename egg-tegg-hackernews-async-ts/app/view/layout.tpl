<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{% block title %}HackerNews (Egg + Tegg){% endblock %}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; margin: 0; background: #f6f6ef; }
    header { background: #ff6600; color: #222; padding: 10px 16px; }
    header a { color: #222; text-decoration: none; font-weight: 700; }
    .container { max-width: 960px; margin: 0 auto; padding: 16px; }
    ul.news { list-style: none; padding: 0; margin: 0; }
    ul.news li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .meta { color: #666; font-size: 12px; }
    .pager { margin: 16px 0; display: flex; gap: 8px; }
    .pager a { background: #ff6600; color: #222; padding: 6px 10px; text-decoration: none; border-radius: 4px; }
    .pill { background: #eee; color: #333; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    pre { background: #fff; padding: 12px; overflow: auto; border: 1px solid #eee; }
  </style>
</head>
<body>
  <header>
    <a href="/">HackerNews</a>
  </header>
  <div class="container">
    {% block content %}{% endblock %}
  </div>
</body>
</html>