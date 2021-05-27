import autocomplete from 'autocompleter';
console.log("IS THIS EVER RUN 0")
var countries = [
    { label: 'United Kingdom', value: 'UK' },
    { label: 'United States', value: 'US' }
];
console.log("IS THIS EVER RUN 1")
var input = document.getElementById("num_input");
console.log("IS THIS EVER RUN 2")
autocomplete({
    input: input,
    fetch: function(text, update) {
        text = text.toLowerCase();
        var suggestions = countries.filter(n => n.label.toLowerCase().startsWith(text))
        update(suggestions);
    },
    onSelect: function(item) {
        input.value = item.label;
    }
});