import re

CESURA_SPACES = 10

class PoemParser:
    def __init__(self, content: str) -> None:
        self.content = content
        self.indent_count = 0
        self.is_aligned = False

    def _parse_word_format(self, poem: str) -> str:
        poem = re.sub(
            r"(?<!\\)\*\*(.*?)\*\*", r"<strong>\1</strong>", poem, flags=re.DOTALL
        )
        poem = re.sub(
            r"(?<!\\)\*(.*?)\*", r"<i>\1</i>", poem, flags=re.DOTALL
        )
        poem = re.sub(r"(?<!\\)_(.*?)_", r"<u>\1</u>", poem, flags=re.DOTALL)
        poem = re.sub(r"(?<!\\)~(.*?)~", r"<s>\1</s>", poem, flags=re.DOTALL)
        
        matches = re.finditer(r"(?<!\\)=([^=]+)=(?:\(([^)]+)\))?", poem, flags=re.DOTALL | re.MULTILINE)
        for match in matches: 
            content = match.group(1)
            if match.group(2):
                color = match.group(2)[1:-1]
                poem = poem.replace(match.group(0), f'<mark style="background:{color}!important;">{content}</mark>')
            else:
                poem = poem.replace(match.group(0), f'<mark>{content}</mark>')
                
        return poem

    def _parse_text_align(self, poem: str) -> str:
        align_count = 0
        for align in ["center", "left"]:
            regex = rf"(?<!\\)<{align}>.?(.*?)(?=<center>|<right>|<left>|$)"
            sub = rf'<div style="text-align:{align};">\1</div>'
            poem, align_count = re.subn(regex, sub, poem, flags=re.DOTALL)

        right_regex = r"(?<!\\)<right>.?(.*?)(?=<center>|<right>|<left>|$)"
        sub = r'<div style="text-align:right;">\1</div>'
        poem, right_align_count = re.subn(right_regex, sub, poem, flags=re.DOTALL)

        if right_align_count > 0 and self.indent_count > 0:
            poem = self._adjust_indentation_right_align(poem)
            
        if align_count > 0 or right_align_count > 0:
            self.is_aligned = True

        return poem

    def _adjust_indentation_right_align(self, poem: str) -> str:
        pattern = r'(<div style="text-align:right;">)(.*?)(?=<div style="text-align:|$)'
        
        def replace_right_block(match):
            opening_tag = match.group(1)
            content = match.group(2)
            
            modified_content = re.sub(
                r'<div style="padding-left:(\d+)ch; margin:0;">(.*?)</div>',
                r'<div style="padding-right:\1ch; margin:0; text-align:right;">\2</div>',
                content,
                flags=re.DOTALL
            )
            
            return opening_tag + modified_content
        
        poem = re.sub(pattern, replace_right_block, poem, flags=re.DOTALL)
        return poem

    def _parse_font_size(self, poem: str) -> str:
        poem = re.sub(
            r"(?<!\\)<([^<]*?)>\((\d+)\)",
            r'<span style="font-size:\2px;">\1</span>',
            poem,
            flags=re.DOTALL,
        )
        return poem

    def _parse_indentation(self, poem: str) -> str:
        # Here I am also capturing the newline in the regex, because otherwise
        # the later <br> would add an extra line break.
        poem, self.indent_count = re.subn(
            r"^(\d+)>(.*\n?)",
            r'<div style="padding-left:\1ch; margin:0;">\2</div>',
            poem,
            flags=re.MULTILINE,
        )
            
        return poem

    def _parse_cesura(self, poem: str) -> str:
        # For the cesura I have chosen to implement it using a fixed number of spaces
        cesura = "&nbsp;" * CESURA_SPACES
        poem = re.sub(
            r"(^.*?)\/\/(.*?$)",
            fr"\1{cesura}\2",
            poem,
            flags=re.MULTILINE,
        )
        return poem

    def to_html(self) -> str:
        poem = self.content

        poem = self._parse_cesura(poem)
        poem = self._parse_word_format(poem)
        poem = self._parse_font_size(poem)
        poem = self._parse_indentation(poem)
        poem = self._parse_text_align(poem)

        # Line breaks
        poem = re.sub(r"\n", "<br>", poem)

        if not self.is_aligned:
            return '<div style="text-align: center;">' + poem + "</div>"
        
        return '<div>' + poem + "</div>"
