"""Compact customer documents; preserves existing catalog prices and approved artwork."""
from pathlib import Path
import json
from io import BytesIO
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('StudioSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('StudioSans-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
from reportlab.lib import colors
from reportlab.platypus import BaseDocTemplate,PageTemplate,Frame,Paragraph,Spacer,KeepTogether,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
import qrcode
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/downloads';cat=json.loads((ROOT/'public/pricing-catalog.json').read_text())
NAVY=colors.HexColor('#06101d');GOLD=colors.HexColor('#b57c20');CYAN=colors.HexColor('#007d96')
logo=Image.open(ROOT/'public/alexela-logo-cutout.png');logo.thumbnail((600,400));back=Image.new('RGB',logo.size,'#06101d');back.paste(logo,mask=logo.getchannel('A') if logo.mode=='RGBA' else None);bio=BytesIO();back.save(bio,format='JPEG',quality=95);LOGO=ImageReader(bio)
URL='https://alexela-passion-to-profit.vercel.app/intake.html'
qr=qrcode.QRCode(box_size=12,border=4,error_correction=qrcode.constants.ERROR_CORRECT_M);qr.add_data(URL);qr.make(fit=True);QR=ImageReader(qr.make_image().convert('RGB'))
def chrome(c,d):
 c.saveState();c.setFillColor(NAVY);c.rect(30,678,552,84,fill=1,stroke=0);c.drawImage(LOGO,35,682,110,74,mask='auto',preserveAspectRatio=True)
 c.setFillColor(colors.white);c.setFont('StudioSans-Bold',21);c.drawString(154,733,'AleXelA');c.setFont('StudioSans-Bold',10);c.setFillColor(colors.HexColor('#66e6fa'));c.drawString(154,716,'PASSION TO PROFIT');c.setFont('StudioSans',8);c.setFillColor(colors.white);c.drawString(154,701,'From Idea to Income. From Pain to Purpose.')
 c.drawImage(QR,505,688,64,64);c.setStrokeColor(GOLD);c.line(30,36,582,36);c.setFillColor(NAVY);c.setFont('StudioSans',8);c.drawString(30,23,'(321) 375-9685 | alexelas.studio@gmail.com');c.drawRightString(582,23,str(d.page));c.restoreState()
body=ParagraphStyle('body',fontName='StudioSans',fontSize=8,leading=10,spaceAfter=4,textColor=NAVY)
head=ParagraphStyle('head',parent=body,fontName='StudioSans-Bold',fontSize=12,leading=14,spaceBefore=7,spaceAfter=5,textColor=CYAN)
def p(s,style=body):return Paragraph(escape(str(s)).replace('\n','<br/>'),style)
def build_guide():
 frames=[Frame(30,48,270,620,leftPadding=0,rightPadding=8,topPadding=0,bottomPadding=0),Frame(312,48,270,620,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)]
 d=BaseDocTemplate(str(OUT/'AleXelA_Price_Guide.pdf'),pagesize=(612,792),title='AleXelA compact price guide',author='AleXelA');d.addPageTemplates(PageTemplate(id='guide',frames=frames,onPage=chrome))
 story=[p('Brand identity & design',head),p('Starting prices in USD. Updated November 9, 2026. Scan the QR to request your project quote.')]
 for item in cat['packages']:
  story.append(KeepTogether([p(item['name']+' - $'+format(item['price'],','),head),p('; '.join(item['features']))]))
 story.extend([p('Online presence & marketing',head),p('Website: Site Sales Solution and agreed premium scopes include a responsive landing page. Additional website and SEO work: custom quote.')])
 for item in cat['monthly']:story.append(p(item['name']+' - $'+str(item['price'])+'/month. '+item['description']))
 story.append(p('Optional design add-ons',head))
 for item in cat['addons']:story.append(p(item['name']+' - $'+str(item['price'])+'. '+item['description']))
 story.extend([PageBreak(),p('Physical products & production',head),p('Pricing below covers the stated product scope. Confirm quantity, material, production method, stock and fulfillment. Specialist wraps and installation require confirmed partner availability.')])
 for group in cat['products']:
  story.append(p(group['title'],head))
  for item in group['items']:story.append(KeepTogether([p(item['name']+' - '+item['price']+'. '+item['description'])]))
 story.extend([p('Quote terms',head),p(cat['terms']),p('Two revision rounds on entry design packages and each agreed premium deliverable. Original custom product artwork setup starts at $50 when needed, waived for supplied production-ready artwork needing no design. Existing package inclusions are not charged twice. Confirm production and third-party costs in writing.'),p('Online intake: '+URL)])
 d.build(story)
def build_intake():
 c=canvas.Canvas(str(OUT/'AleXelA_Intake_Form.pdf'),pagesize=(612,792));c.setTitle('AleXelA one-page project intake');
 class D:page=1
 chrome(c,D());y=660
 def heading(text):
  nonlocal y
  c.setFillColor(CYAN);c.setFont('StudioSans-Bold',12);c.drawString(30,y,text);y-=18
 def line(text,height=27):
  nonlocal y
  c.setFillColor(NAVY);c.setFont('StudioSans',8.5);c.drawString(30,y,text);c.setStrokeColor(colors.HexColor('#9babb8'));c.line(30,y-15,582,y-15);y-=height
 heading('1. Your business & contact')
 for t in ['Business / project name:','Contact name:                                      Email:','Phone:                                       Service area:                                   Contact: Text / Email / Call','Services, products & ideal customers:','Project goals / problems to solve:']:line(t)
 heading('2. Scope, budget & timing')
 line('Package / custom request:                           Budget:                           Requested deadline:')
 c.setFont('StudioSans',8);c.drawString(30,y,'Design packages: $75 / $125 / $175 / $350 / $500 / $650 / $850 / $1,200 / $1,500 / $2,000');y-=15
 for t in ['Online: [ ] Logo / identity   [ ] Website   [ ] SEO   [ ] Social media   [ ] Ads   [ ] Copywriting','Print: [ ] Business cards   [ ] Flyers   [ ] Door hangers   [ ] Bookmarks   [ ] Labels / packaging','Signs: [ ] Yard / road signs   [ ] Banners   [ ] Vehicle decals   [ ] Wrap consultation   [ ] Stickers','Merch: [ ] Fridge magnets   [ ] Shirts   [ ] Hats   [ ] Shorts   [ ] Backpacks   [ ] Bags   [ ] Mugs','Gifts: [ ] Coasters   [ ] Keychains   [ ] Name tags   [ ] Mouse pads   [ ] Luggage tags   [ ] Other']:
  c.drawString(30,y,t);y-=14
 y-=6;heading('3. Creative direction & production')
 for t in ['Logo: Keep / Update / New     Brand feel:                        Colors to use / avoid:','Exact business wording, tagline & contact details:','Website / social links / exact QR destination:','Products, quantities, dimensions, materials, sides & print method:','Optional add-ons / references / Drive folder link:','Additional notes:']:line(t,28)
 c.setFont('StudioSans',8);c.setFillColor(NAVY)
 for t in ['This requests a written quote; it does not confirm price, payment or delivery date. Physical production,','blanks, shipping, tax, ad spend, domains, hosting and third-party fees are separate unless agreed.','Scan the QR for the online intake, or send this completed form to Alex. Avoid sensitive personal data.']:
  c.drawString(30,y,t);y-=11
 c.setFont('StudioSans',7.5);c.drawString(30,y,URL);c.save()
build_guide();build_intake()
