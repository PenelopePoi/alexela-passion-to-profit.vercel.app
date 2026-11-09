from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
for name, filename in [('StudioSans','DejaVuSans.ttf'),('StudioSans-Bold','DejaVuSans-Bold.ttf'),('StudioSerif-Bold','DejaVuSerif-Bold.ttf'),('StudioSerif-BoldItalic','DejaVuSerif-Bold.ttf'),('StudioSerif-Italic','DejaVuSerif.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+filename))
from reportlab.lib.utils import ImageReader
import qrcode
from PIL import Image
from xml.sax.saxutils import escape
OUT=Path('public/downloads');OUT.mkdir(exist_ok=True)
cat=json.loads(Path('public/pricing-catalog.json').read_text())
styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='TitleX',fontName='StudioSans-Bold',fontSize=26,leading=29,spaceAfter=10,textColor=colors.HexColor('#0b2238')));styles.add(ParagraphStyle(name='SubX',fontName='StudioSans',fontSize=10,leading=15,spaceAfter=10));styles.add(ParagraphStyle(name='HeadX',fontName='StudioSans-Bold',fontSize=15,leading=20,spaceBefore=10,spaceAfter=7,textColor=colors.HexColor('#0b2238')));styles.add(ParagraphStyle(name='BodyX',fontName='StudioSans',fontSize=9,leading=13,spaceAfter=6));styles.add(ParagraphStyle(name='SmallX',fontName='StudioSans',fontSize=8,leading=11,spaceAfter=4));styles.add(ParagraphStyle(name='LabelX',fontName='StudioSans-Bold',fontSize=9,leading=13,spaceAfter=6))
def clean(s):return escape(str(s).replace('’',"'").replace('–','-').replace('—','-').replace('×','x').replace('·',' | '))
def P(s,style='BodyX'):return Paragraph(clean(s),styles[style])
def page(c,d):
 c.saveState();w,h=d.pagesize;c.setStrokeColor(colors.HexColor('#b8c7d4'));c.line(36,35,w-36,35);c.setFont('StudioSans',7);c.setFillColor(colors.HexColor('#40576c'));c.drawString(36,23,'AleXelA | (321) 375-9685 | xelabrandingstudio@gmail.com');c.drawRightString(w-36,23,str(d.page));c.restoreState()
def doc(name,story):SimpleDocTemplate(str(OUT/name),pagesize=(612,792),rightMargin=36,leftMargin=36,topMargin=35,bottomMargin=47,title=name.replace('_',' '),author='AleXelA Creative Branding Studio').build(story,onFirstPage=page,onLaterPages=page)
def title(name,sub):return [P('AleXelA','LabelX'),P(name,'TitleX'),P(sub,'SubX')]
story=title('Branding & launch price guide','Starting design prices in USD | Updated November 5, 2026')
for tier,titletext in [('budget','Get started'),('premium','Get customers'),('elite','Get everything')]:
 if tier!='budget':story.append(PageBreak());story+=title('Branding & launch price guide',titletext+' | One-time design packages')
 else:story.append(P(titletext,'HeadX'))
 for p in cat['packages']:
  if p['tier']!=tier:continue
  block=[P(p['name']+' - $'+format(p['price'],','),'HeadX'),P(p['description'],'BodyX')]
  block += [P('- '+f,'SmallX') for f in p['features']]
  block.append(Spacer(1,10));story.append(KeepTogether(block))
 story.append(P('Design files and agreed services only. Physical production and third-party costs are separate.','SmallX'))
story.append(PageBreak());story+=title('Extras & ongoing support','Choose only the work your package does not already include.')
story.append(P('Optional one-time design add-ons','HeadX'))
for a in cat['addons']:
 row=Table([[Paragraph(clean(a['name'])+'<br/><font size=8>'+clean(a['description'])+'</font>',styles['BodyX']),P('$'+str(a['price']),'LabelX')]],colWidths=[460,80]);row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,-1),(-1,-1),.3,colors.HexColor('#cbd6df')),('BOTTOMPADDING',(0,-1),(-1,-1),2)]));story.append(row)
story.append(P('Optional monthly support','HeadX'))
for a in cat['monthly']:story.append(P(a['name']+' - $'+str(a['price'])+'/month','LabelX'));story.append(P(a['description'],'SmallX'))
story.append(P('How your quote works','HeadX'));story.append(P(cat['terms'],'SmallX'));story.append(P('Two revision rounds on entry packages and each agreed premium deliverable. Extra rounds, new directions and complex artwork are quoted clearly.','SmallX'))
story.append(P('Compare and customize: https://alexela-passion-to-profit.vercel.app/price-guide.html','SmallX'))
story.append(PageBreak());story+=title('Decals, stickers & vinyl','Physical product starting prices. Standard outdoor vinyl; design, tax and shipping may be extra.')
for group in cat['products'][:2]:
 story.append(P(group['title'],'HeadX'))
 for item in group['items']:
  row=Table([[Paragraph(clean(item['name'])+'<br/><font size=8>'+clean(item['description'])+'</font>',styles['BodyX']),P(item['price'],'LabelX')]],colWidths=[460,80]);row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,-1),(-1,-1),.3,colors.HexColor('#cbd6df')),('BOTTOMPADDING',(0,-1),(-1,-1),2)]));story.append(row)
story.append(PageBreak());story+=title('Merch & promotional products','Starting retail rates; stock, quantity and vendor availability confirmed in your quote.')
for group in cat['products'][2:]:
 for item in group['items']:
  row=Table([[Paragraph(clean(item['name'])+'<br/><font size=8>'+clean(item['description'])+'</font>',styles['BodyX']),P(item['price'],'LabelX')]],colWidths=[460,80]);row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,-1),(-1,-1),.3,colors.HexColor('#cbd6df')),('BOTTOMPADDING',(0,-1),(-1,-1),2)]));story.append(row)
story.append(P('Original custom artwork setup starts at $50 when needed; waived for supplied production-ready art requiring no design. No duplicate charges for artwork already included. Installation, specialty materials, tax and shipping are separate. Bulk quantities of 12+ are quoted individually.','SmallX'))
doc('AleXelA_Price_Guide.pdf',story)
# Two-page, handwriting-friendly intake.
story=title('Project brief','Your vision, in focus. Complete by hand or use the online intake.')
def field(label,lines=1):
 block=[P(label,'LabelX')]
 for i in range(lines):
  t=Table([['']],colWidths=[540],rowHeights=[22]);t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#899aa9'))]));block.append(t)
 block.append(Spacer(1,8));return KeepTogether(block)
for label,lines in [('Business / project name',1),('Contact name | Email | Phone',2),('Service area / preferred contact method',1),('What do you do, and who are your ideal customers?',3),('Project goals / problems to solve',2),('Preferred package / working budget / requested deadline',2)]:story.append(field(label,lines))
story.append(PageBreak());story+=title('Creative direction & production','Add reference images or a Drive link when you send your completed brief.')
for label,lines in [('Existing logo / brand feel / colors to use or avoid',2),('Exact wording, contact details and QR destination to include',3),('Items, quantities, dimensions, materials and sides',3),('Optional add-ons / reference links / additional notes',3)]:story.append(field(label,lines))
story.append(P('Starting packages: $75 / $125 / $175 / $350 / $500 / $650 / $850 / $1,200 / $1,500 / $2,000. See the current price guide for inclusions.','SmallX'))
story.append(P('This brief requests a quote. It does not collect payment, guarantee a price or confirm a deadline. Physical production, tax, shipping, ad spend and third-party fees are separate unless listed in your written quote.','SmallX'))
story.append(P('Online intake: https://alexela-passion-to-profit.vercel.app/intake.html','SmallX'))
doc('AleXelA_Intake_Form.pdf',story)
# Two-sided card: 3.5 x 2 in trim, 1/8 in bleed on every side.
w,h=270,162;c=canvas.Canvas(str(OUT/'AleXelA_Business_Card_Front_Back.pdf'),pagesize=(w,h));c.setTitle('AleXelA business card - front and back - 3.5 x 2 inch trim');c.setAuthor('AleXelA Creative Branding Studio')
logo=ImageReader(Image.open('public/alexela-logo-cutout.png').resize((780,520),Image.Resampling.LANCZOS))
def cardbg():
 c.setFillColor(colors.HexColor('#06101d'));c.rect(0,0,w,h,fill=1,stroke=0);c.setStrokeColor(colors.HexColor('#e9b85d'));c.setLineWidth(.6);c.line(22,20,w-22,20)
cardbg();c.drawImage(logo,19,42,width=130,height=87,mask='auto',preserveAspectRatio=True,anchor='c');c.setFillColor(colors.HexColor('#e9b85d'));c.setFont('StudioSerif-BoldItalic',22);c.drawString(147,107,'AleXelA');c.setFont('StudioSans',5.3);c.setFillColor(colors.white);c.drawString(149,94,'CREATIVE BRANDING STUDIO');c.setFont('StudioSerif-Italic',13);c.drawString(149,72,'Passion to Profit');c.setFont('StudioSans',7);c.drawString(149,54,'Cocoa • Space Coast, FL');c.setFont('StudioSans-Bold',8);c.setFillColor(colors.HexColor('#6be6fa'));c.drawCentredString(w/2,29,'LOGOS  |  PRINT  |  DECALS  |  WEBSITES');c.showPage();cardbg();c.setFillColor(colors.HexColor('#e9b85d'));c.setFont('StudioSerif-Bold',15);c.drawString(23,125,'Alex Weatherspoon');c.setFont('StudioSans',6.2);c.setFillColor(colors.white);c.drawString(24,111,'CREATIVE DIRECTOR  /  BRANDING & PRODUCTION');c.setFont('StudioSans-Bold',13);c.setFillColor(colors.HexColor('#6be6fa'));c.drawString(24,88,'(321) 375-9685');c.setFillColor(colors.white);c.setFont('StudioSans',8);c.drawString(24,70,'xelabrandingstudio@gmail.com');c.setFont('StudioSans',6.2);c.drawString(24,55,'Logos • Cards • Flyers • Stickers • Signs');c.drawString(24,44,'Custom Merch • Websites • Marketing');
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=10,border=4);qr.add_data('https://alexela-passion-to-profit.vercel.app/');qr.make(fit=True);qim=qr.make_image(fill_color='black',back_color='white').convert('RGB');qim.save(OUT/'AleXelA_Website_QR.png');c.drawImage(ImageReader(qim),192,39,55,55);c.setFont('StudioSans-Bold',6);c.setFillColor(colors.HexColor('#e9b85d'));c.drawCentredString(219.5,29,'EXPLORE & START');c.showPage();c.save()
# Explicit trim and bleed boxes for printer handoff.
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
path=OUT/'AleXelA_Business_Card_Front_Back.pdf';r=PdfReader(path);wr=PdfWriter()
for p in r.pages:p.trimbox=RectangleObject([9,9,261,153]);p.bleedbox=RectangleObject([0,0,270,162]);wr.add_page(p)
with open(path,'wb')as f:wr.write(f)
print('Created price guide, two-page intake, two-sided card and QR asset.')

# Keep the compact customer documents authoritative after legacy card generation.
import runpy
runpy.run_path(str(Path(__file__).with_name('build-compact-guides.py')))
