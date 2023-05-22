// NB: This function can still return unsafe HTML
export const unescapeHTML = (html) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n').replace(/<[^>]*>/g, '');
  return wrapper.textContent;
};

export function strip(html){
  let op = ''

  try {
   let doc = new DOMParser().parseFromString(html, 'text/html');
   op = doc.body.textContent || '';
  } catch (err) {
    console.error('error parsing html', err)
  }

   return  op
}
