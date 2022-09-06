$('.js_accordion .js_accordion_ttl').on('click', function () {
  $(this).toggleClass('is_active');
  const $body = $(this).parent().next('.js_accordion_body');
  if ($body.hasClass('is_active')) {
    $body.removeClass('is_active').stop().slideUp(250);
  } else {
    $body.addClass('is_active').stop().slideDown(250);
  }
});
