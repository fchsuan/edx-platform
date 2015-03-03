var edx = edx || {};

(function($) {
    'use strict';

    edx.student = edx.student || {};
    edx.student.account = edx.student.account || {};

    edx.student.account.EnrollmentInterface = {

        urls: {
            enrollment: '/api/enrollment/v1/enrollment',
            enrollmentInfo: 'api/enrollment/v1/course',
            trackSelection: '/course_modes/choose/'
        },

        headers: {
            'X-CSRFToken': $.cookie('csrftoken')
        },

        /**
         * Get the Course Enrollment Info for a course. This can be used to describe what options are available
         * for enrolling in a course, including all available course modes, start and end dates, and SKUs mapping
         * to the Course Catalog. This information can be used to determine how an enrollment should be fulfilled.
         *
         * @param {string} courseKey Slash-separated course key
         * @returns The enrollment information for a course.
         */
        enrollment_info: function( courseKey ) {
            var data = JSON.stringify(data_obj);
            return $.ajax({
                url: this.enrollmentInfoUrl( courseKey ),
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                headers: this.headers,
                context: this
            })
            .done(function( jqXHR ) {
                return JSON.parse(jqXHR.responseText);
            });
        },

        /**
         * Enroll a user in a course, then redirect the user
         * to the track selection page.
         * @param  {string} courseKey  Slash-separated course key.
         */
        enroll: function( courseKey ) {
            var data_obj = {
                course_details: {
                    course_id: courseKey
                }
            };
            var data = JSON.stringify(data_obj);
            $.ajax({
                url: this.urls.enrollment,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: data,
                headers: this.headers,
                context: this
            })
            .fail(function( jqXHR ) {
                var responseData = JSON.parse(jqXHR.responseText);
                if ( jqXHR.status === 403 && responseData.user_message_url ) {
                    // Check if we've been blocked from the course
                    // because of country access rules.
                    // If so, redirect to a page explaining to the user
                    // why they were blocked.
                    this.redirect( responseData.user_message_url );
                }
                else {
                    // Otherwise, go to the track selection page as usual.
                    // This can occur, for example, when a course does not
                    // have a free enrollment mode, so we can't auto-enroll.
                    this.redirect( this.trackSelectionUrl( courseKey ) );
                }
            })
            .done(function() {
                // If we successfully enrolled, go to the track selection
                // page to allow the user to choose a paid enrollment mode.
                this.redirect( this.trackSelectionUrl( courseKey ) );
            });
        },

        /**
         * Construct the URL for the Enrollment Info Endpoint.
         * @param courseKey The slash-separated course key.
         * @returns {string} The URL to get course level enrollment info.
         */
        enrollmentInfoUrl: function ( courseKey ) {
            return this.urls.enrollmentInfo + courseKey;
        },

        /**
         * Construct the URL to the track selection page for a course.
         * @param  {string} courseKey Slash-separated course key.
         * @return {string} The URL to the track selection page.
         */
        trackSelectionUrl: function( courseKey ) {
            return this.urls.trackSelection + courseKey + '/';
        },

        /**
         * Redirect to a URL.  Mainly useful for mocking out in tests.
         * @param  {string} url The URL to redirect to.
         */
        redirect: function(url) {
            window.location.href = url;
        }
    };
})(jQuery);
