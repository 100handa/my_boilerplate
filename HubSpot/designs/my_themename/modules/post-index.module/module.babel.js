let $body = $('#hs_cos_wrapper_post_body');
const bodyCont = $body.html();

if (typeof bodyCont == 'string') {
  const $postIndex = $('.js_index');
  const $tempWrapper = $('<div>').html($postIndex.clone());
  const indexCont = $tempWrapper.html();
  $postIndex.remove();

  const newCont = bodyCont.replace(/<!-- ?more ?-->/, indexCont);
  $body.html(newCont);
}
