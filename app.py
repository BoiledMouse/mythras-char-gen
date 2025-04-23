```python
from flask import Flask, request, send_file, render_template_string
import re
import io
from pypdf import PdfReader, PdfWriter

app = Flask(__name__)
