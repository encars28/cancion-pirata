from app.poem_parser import PoemParser

def test_parser_cesura() -> None: 
    input_text = """De los sos ojos//tan fuertemientre llorando,
tornava la cabeça//e estávalos catando.
Vio puertas abiertas//e uços sin cañados,
alcándaras vazías,//sin pielles e sin mantos,
e sin falcones//e sin adtores mudados."""

    spaces = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
    output_text = f"De los sos ojos{spaces}tan fuertemientre llorando,<br>tornava la cabeça{spaces}e estávalos catando.<br>Vio puertas abiertas{spaces}e uços sin cañados,<br>alcándaras vazías,{spaces}sin pielles e sin mantos,<br>e sin falcones{spaces}e sin adtores mudados."
    poem_parser = PoemParser(input_text)
    assert poem_parser.to_html() == output_text

def test_parser_align() -> None:
    input_text = """<center>
Con diez cañones por banda,
viento en popa a toda vela,
<right>
no corta el mar, sino vuela
un velero bergantín;"""

    output_text = '<div style="text-align:center;">Con diez cañones por banda,<br>viento en popa a toda vela,<br></div><div style="direction:rtl;">no corta el mar, sino vuela<br>un velero bergantín;</div>'

    poem_parser = PoemParser(input_text)
    assert poem_parser.to_html() == output_text


def test_parser_word_format() -> None:
    input_text = """Con diez **cañones** por banda,
viento en popa __a toda vela,__
no --corta-- el mar, sino ==vuela==
un velero bergantín;"""

    output_text = "Con diez <strong>cañones</strong> por banda,<br>viento en popa <i>a toda vela,</i><br>no <s>corta</s> el mar, sino <u>vuela</u><br>un velero bergantín;"

    poem_parser = PoemParser(input_text)
    assert poem_parser.to_html() == output_text


def test_parser_font_size() -> None:
    input_text = """Con <diez>(20) cañones por banda,
viento en popa a toda vela,
no corta el <mar>(8), sino vuela
un velero bergantín;"""

    output_text = 'Con <span style="font-size:20px;">diez</span> cañones por banda,<br>viento en popa a toda vela,<br>no corta el <span style="font-size:8px;">mar</span>, sino vuela<br>un velero bergantín;'

    poem_parser = PoemParser(input_text)
    assert poem_parser.to_html() == output_text


def test_parser_indent() -> None:
    input_text = """1> Con diez cañones por banda,
viento en popa a toda vela,
no corta el mar, sino vuela
2>un velero bergantín;"""

    output_text = '<div style="text-indent:1em;">Con diez cañones por banda,</div><br>viento en popa a toda vela,<br>no corta el mar, sino vuela<br><div style="text-indent:2em;">un velero bergantín;</div>'

    poem_parser = PoemParser(input_text)
    assert poem_parser.to_html() == output_text


def test_indent_right_align() -> None:
    input_text = """<right>
1> Con diez cañones por banda,
viento en popa a toda vela,
no corta el mar, sino vuela
2>un velero bergantín;"""

    output_text = '<div style="direction:rtl;"><div style="text-indent:1em;">,Con diez cañones por banda</div><br>viento en popa a toda vela,<br>no corta el mar, sino vuela<br><div style="text-indent:2em;">;un velero bergantín</div></div>'

    poem_parser = PoemParser(input_text)
    assert poem_parser.to_html() == output_text
