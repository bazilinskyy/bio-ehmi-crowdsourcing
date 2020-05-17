/**
 * jspsych-survey-html-form
 * a jspsych plugin for free html forms
 *
 * Jan Simson
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['survey-html-form-ranking'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-html-form-ranking',
    description: '',
    parameters: {
      html: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'HTML',
        default: null,
        description: 'HTML formatted string containing all the input elements to display. Every element has to have its own distinctive name attribute. The <form> tag must not be included and is generated by the plugin.'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to finish the trial.'
      },
      dataAsArray: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        pretty_name: 'Data As Array',
        default:  false,
        description: 'Retrieve the data as an array e.g. [{name: "INPUT_NAME", value: "INPUT_VALUE"}, ...] instead of an object e.g. {INPUT_NAME: INPUT_VALUE, ...}.'
      },
      unique_values: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Unique values',
        default: false,
        description: 'If true, the participant will have to input unique values in each row.'
      },
      rows: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of row',
        default: '',
        description: 'Number of rows in ranking.'
      },
      items_per_row: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Items per row',
        default: '',
        description: 'Number of items per row in ranking.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // hacky, but whatever [javascript...] :)
    if(trial.unique_values){
    var rankings_given = [];
      for(var i = 0; i < 1; i++) {
        rankings_given[i] = new Array(trial.items_per_row);
      }
    }

    var html = '';
    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-html-form-preamble" class="jspsych-survey-html-form-preamble">'+trial.preamble+'</div>';
    }
    // start form
    html += '<form id="jspsych-survey-html-form">'

    // add form HTML / input elements
    html += trial.html;

    // add submit button
    html += '<input type="submit" id="jspsych-survey-html-form-next" class="jspsych-btn jspsych-survey-html-form" '+ (trial.unique_values ? "disabled" : "") + ' value="'+trial.button_label+'"></input>';

    html += '</form>'
    display_element.innerHTML = html;

    display_element.querySelector('#jspsych-survey-html-form').addEventListener('submit', function(event) {
      // don't submit form
      event.preventDefault();

      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      var question_data = serializeArray(this);

      if (!trial.dataAsArray) {
        question_data = objectifyForm(question_data);
      }

      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = performance.now();

    // check if all entries in row are unique
    if(trial.unique_values){
      for (var row = 0; row < trial.rows; row++) { // iterate over rows
        for (var item = 0; item < trial.items_per_row; item++) {  // iterate over items in each row
          console.log('#input' + row + '-' + item);
          display_element.querySelector('#input' + row + '-' + item).addEventListener('input', function(){
            rankings_given[row][item] = display_element.querySelector('#input' + row + '-' + item).value;
            // check if all 4 sliders were moved
            var unique_values = rankings_given[row].filter((item, i, ar) => ar.indexOf(item) === i);
            console.log(row, item, unique_values);
            if (unique_values.length = trial.items_per_row) {  // check if all items in array are unique
              display_element.querySelector('#jspsych-survey-html-form-next').disabled = false;
            } else { // if not unique, make button disables
              display_element.querySelector('#jspsych-survey-html-form-next').disabled = true;
            }
          })
        }
      }
    }
  };

  /*!
   * Serialize all form data into an array
   * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Node}   form The form to serialize
   * @return {String}      The serialized form data
   */
  var serializeArray = function (form) {
    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < form.elements.length; i++) {
      var field = form.elements[i];

      // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

      // If a multi-select, get all selections
      if (field.type === 'select-multiple') {
        for (var n = 0; n < field.options.length; n++) {
          if (!field.options[n].selected) continue;
          serialized.push({
            name: field.name,
            value: field.options[n].value
          });
        }
      }

      // Convert field data to a query string
      else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
        serialized.push({
          name: field.name,
          value: field.value
        });
      }
    }

    return serialized;
  };

  // from https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
  function objectifyForm(formArray) {//serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  return plugin;
})();
