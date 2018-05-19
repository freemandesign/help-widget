if (!Object.assign) {
    alert("Sorry, your web browser is not supported by Friendly Manager. If you are using Internet Explorer you will need to switch to Edge, Chrome, or another modern browser.");
    window.location = '/logout';
}

// Word starts with matcher
$.fn.typeahead_orig.Constructor.defaults.matcher = function(item) {
    var value = (typeof item === 'string' ? item : item.name).toLowerCase();
    var search = this.query.toLowerCase();
    if (search.includes(' ')) {
        return value.includes(search);
    } else {
        var haystack = value.split(' ');
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i].startsWith(search)) return true;
        }
        return false;
    }
}

$(function() {
    $('#navbar-search').typeahead({
        source: '/get/search.json?type=main',
        afterSelect: function(item) {
            if (item.type == 'person') window.location = '/people/' + item.id;
            if (item.type == 'group') window.location = '/groups/' + item.id;
            this.$element.val('');
        },
        highlighter: function(text, item) {
            var icon = '';
            if (item.type == 'person') icon = 'user';
            else if (item.type == 'group') icon = 'sitemap';
            return '<i class="fa fa-' + icon + '"></i>&nbsp; ' + text;
        }
    });

    // Mobile menu
    $('.sub-toggle').click(function(e) {
        document.documentElement.clientWidth < 768 ? e.preventDefault() : e.stopImmediatePropagation();
    });

    $('.sidebar-toggle').click(function() {
        $('.sidebar').toggleClass('active');
    });

    $('.refer-friend').click(function() {
        $.get('/get/referral', function(result) {
            var modal = bootbox.formDialog({
                title: "Tell your friends and get $50 Friendly Manager credit!",
                size: 'large',
                className: 'modal-primary',
                message: result,
                buttons: {
                    Cancel: {},
                    send: {
                        label: 'Send Email <i class="fa fa-envelope"></i>',
                        callback: function(data) {
                            var button = modal.find('.btn-primary').button('loading');
                            $.post('/post/referral.json', data).done(function(result) {
                                if (result.sent) {
                                    modal.modal('hide');
                                    bootbox.alert({
                                        title: "Referral Sent",
                                        message: "Thanks for the referral, we will be in touch to let you know the outcome.",
                                        className: 'modal-success'
                                    });
                                } else {
                                    button.button('reset');
                                    bootbox.alert({
                                        title: "Referral Not Sent",
                                        message: result.error,
                                        className: 'modal-danger'
                                    });
                                }
                            });
                            return false;
                        }
                    }
                }
            });
        });
    });

    if ($('.xero-overdue.hidden').length) $.get('/get/xero-overdue.json', function(overdue) {
        if (overdue) $('.xero-overdue').attr('title', '$' + overdue.toFixed(2) + ' Overdue').removeClass('hidden');
    });

    $('.notification').delay(500).fadeIn();
    $('.notification-close').click(function() {
        $(this).closest('.notification').fadeOut();
        $.post('/post/settings', {
            'notification-viewed': $(this).data('id')
        });
    });

    $('.emails-more').click(function() {
        $(this).closest('.emails-overflow').removeClass('emails-overflow');
        $(this).remove();
    });

    $('#fm_termsModal').modal().find('input').change(function() {
        $('#fm_termsModal .btn-primary').prop('disabled', !this.checked);
    }).end().find('.btn-primary').click(function() {
        $('#fm_termsModal :input').prop('disabled', true);
        $.post('/post/fm-terms', function() {
            $('#fm_termsModal').modal('hide');
        });
    });
});