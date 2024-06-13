const katex = import('katex');

export async function latexify(str: string): Promise<string> {
    // math rendering errors are handled by katex itself since throwOnError=false
    const renderToString = (await katex).renderToString;
    return str.replace(/\$\$.+?\$\$/gm, (match) => {
        try {
            return renderToString(match.substring(2, match.length - 2).trim(), { throwOnError: false });
        } catch (e) {
            console.error(e);
            return "<span style='color: red'>Math error</span>";
        }
    }).replace(/\$.+?\$/gm, (match) => {
        try {
            return renderToString(match.substring(1, match.length - 1).trim(), { throwOnError: false });
        } catch (e) {
            console.error(e);
            return "<span style='color: red'>Math error</span>";
        }
    });
}

export default latexify;