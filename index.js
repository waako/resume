var fs = require('fs');
var Handlebars = require('handlebars');
var gravatar = require('gravatar');
var _ = require('underscore');
var moment = require('moment');

// Utity Methods ( need be moved to a separate file)

function hasEmail(resume) {
    return !!resume.basics && !! resume.basics.email;
}

function getNetwork(profiles, network_name) {
    return _.find(profiles, function(profile) {
        return profile.network.toLowerCase() === network_name;
    });
}

function humanizeDuration ( moment_obj ) {
    var months = moment_obj.months(),
        years = moment_obj.years(),
        month_str = months > 1 ? 'months' : 'month',
        year_str = years > 1 ? 'years' : 'year';

    if ( months && years ) {
        return years + ' ' + year_str + ' ' + months + ' ' + month_str;
    }

    if ( months ) {
        return months + ' ' + month_str;
    }

    if ( years ) {
        return years + ' ' + year_str;
    }

    return 'Recently joined';
}

function render(resume) {
    var css = fs.readFileSync(__dirname + '/style.css', 'utf-8'),
        template = fs.readFileSync(__dirname + '/resume.template', 'utf-8'),
        profiles = resume.basics.profiles,
        twitter_account = getNetwork(profiles, 'twitter'),
        github_account = getNetwork(profiles, 'github');

    if (hasEmail(resume)) {
        resume.basics.gravatar = gravatar.url(resume.basics.email, {
            s: '100',
            r: 'pg',
            d: 'mm'
        });
    }

    if ( resume.languages ) {
        resume.basics.languages = _.pluck( resume.languages, 'language' ).join( ', ' );
    }
    _.each( resume.work, function( work_info ) {
        var start_date = work_info.startDate && new Date( work_info.startDate ),
            end_date = work_info.endDate && new Date( work_info.endDate ),
            date_format = 'MMM, YYYY';

        if ( start_date ) {
            work_info.startDate = moment( start_date ).format( date_format );
        }

        if ( end_date ) {
            work_info.endDate = moment( end_date ).format( date_format );
        }

        end_date = end_date || new Date();
        work_info.duration = humanizeDuration( moment.duration( end_date.getTime() - start_date.getTime() ) )
    });

    twitter_account && _.extend(resume.basics, {
        twitterHandle: twitter_account.username
    });
    github_account && _.extend(resume.basics, {
        githubUsername: github_account.username
    });

    return Handlebars.compile(template)({
        css: css,
        resume: resume
    });
}

module.exports = {
    render: render
};
