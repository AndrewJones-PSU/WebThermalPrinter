# smallertext.md

This file is a slimmed down version of (mxstbr's markdown-test-file)[https://github.com/mxstbr/markdown-test-file] that
omits most of the explanations. With the explanations, the print is around 5 and a half feet long. To save paper, this file
exists.

# Markdown: Syntax

-   [Block Elements](#block)
    -   [Blockquotes](#blockquote)
    -   [Lists](#list)
    -   [Code Blocks](#precode)
    -   [Horizontal Rules](#hr)
-   [Span Elements](#span)
    -   [Links](#link)
    -   [Emphasis](#em)
    -   [Code](#code)
    -   [Images](#img)
-   [Miscellaneous](#misc)
    -   [Backslash Escapes](#backslash)
    -   [Automatic Links](#autolink)

**Note:** This document is itself written using Markdown; you can
[see the source for it by adding '.text' to the URL](/projects/markdown/syntax.text).

---

## Block Elements

### Blockquotes

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

> ## This is a header.
>
> 1.  This is the first list item.
> 2.  This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");

### Lists

-   Red
-   Green
-   Blue

1.  Bird
2.  McHale
3.  Parish

-   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.

-   A list item with a code block:

        <code goes here>

### Code Blocks

This is a normal paragraph:

    This is a code block.

    tell application "Foo"
        beep
    end tell

    <div class="footer">
        &copy; 2004 Foo Corporation
    </div>

```
tell application "Foo"
    beep
end tell
```

## Span Elements

### Links

This is [an example](http://example.com/) inline link.

[This link](http://example.net/) has no title attribute.

### Emphasis

*single asterisks* _single underscores_

**double asterisks** __double underscores__

### Code

Use the `printf()` function.
