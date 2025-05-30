import re


class PoemParser:
    def __init__(self, content: str) -> None:
        self.content = content
        self.indent_count = 0

    def _parse_word_format(self, poem: str) -> str:
        poem = re.sub(
            r"(?<!\\)\*\*(.*?)\*\*", r"<strong>\1</strong>", poem, flags=re.DOTALL
        )
        poem = re.sub(r"(?<!\\)__(.*?)__", r"<i>\1</i>", poem, flags=re.DOTALL)
        poem = re.sub(r"(?<!\\)==(.*?)==", r"<u>\1</u>", poem, flags=re.DOTALL)
        poem = re.sub(r"(?<!\\)--(.*?)--", r"<s>\1</s>", poem, flags=re.DOTALL)
        return poem

    def _parse_text_align(self, poem: str) -> str:
        for align in ["center", "left"]:
            regex = rf"(?<!\\)<{align}>.?(.*?)(?=<center>|<right>|<left>|$)"
            sub = rf'<div style="text-align:{align};">\1</div>'
            poem = re.sub(regex, sub, poem, flags=re.DOTALL)

        right_regex = r"(?<!\\)<right>.?(.*?)(?=<center>|<right>|<left>|$)"
        sub = r'<div style="text-align:right;">\1</div>'
        poem, count = re.subn(right_regex, sub, poem, flags=re.DOTALL)

        if count > 0 and self.indent_count > 0:
            poem = self._adjust_indentation_right_align(poem)

        return poem

    def _adjust_indentation_right_align(self, poem: str) -> str:
        matches = re.finditer(
            r'<div style="text-align:right;">.*?</div>($|<div style="text-align:)',
            poem,
            flags=re.DOTALL,
        )
        indent_matches = re.findall(
            r'<div style="text-indent:\d;">.*?</div>', poem, flags=re.DOTALL
        )

        for match in matches:
            for i_match in indent_matches:
                if (
                    poem.index(i_match) > match.start()
                    and poem.index(i_match) < match.end()
                ):
                    new_match = re.sub(
                        r'<div style="text-indent:(\d);">(.*?)</div>',
                        r'<div style="text-indent:\1; direction: rtl;">\2&lrm;</div>',
                        i_match,
                        flags=re.MULTILINE,
                    )
                    poem = poem.replace(i_match, new_match)

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
        poem, self.indent_count = re.subn(
            r"^(\d)> ?(.*?)$",
            r'<div style="text-indent:\1em;">\2</div>',
            poem,
            flags=re.MULTILINE,
        )
        return poem

    def _parse_cesura(self, poem: str) -> str:
        poem = re.sub(
            r"(^.*?)\/\/(.*?$)",
            r"\1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\2",
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

        return poem
