// ============== BUDGET CONTROLLER ==============

var budgetController = (function(){
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(income){
    if (income > 0){
      this.percentage = Math.round((this.value / income) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotals = function(type){
    var total = 0;
    data.allItems[type].forEach(function(el){
      total += el.value;
    });
    data.totals[type] = total;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val){
      var newItem, id;
      // Create new ID
      if (data.allItems[type].length > 0){
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      // Create New Item
      if (type === 'exp'){
        newItem = new Expense(id, des, val);
      } else if (type === 'inc') {
        newItem = new Income(id, des, val);
      }

      // Push Item it to the Array
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id){
      var idArray, index;

      idArray = data.allItems[type].map(function(el){
        return el.id;
      });
      index = idArray.indexOf(id);
      data.allItems[type].splice(index, 1);
    },

    calculateBudget: function(){
      //Calculate totals
      calculateTotals('inc');
      calculateTotals('exp');

      //Calculate budget
      data.budget = data.totals.inc - data.totals.exp;

      //Calculate percentage
      if (data.totals.inc > 0){
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function(){
      data.allItems.exp.forEach(function(el){
        el.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function(){
      var percentage = data.allItems.exp.map(function(el){
        return el.percentage;
      });
      return percentage;
    },

    getBudget: function(){
      return {
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        budget: data.budget,
        percentage: data.percentage
      }
    },

    testing: function(){
      console.log(data);
    }
  };

})();

// ============== USER INTERFACE CONTROLLER ==============

var UIController = (function(){
  var DOMsting = {
    type: '.add__type',
    description: '.add__description',
    value: '.add__value',
    add_btn: '.add__btn',
    incomeList: '.income__list',
    expensesList: '.expenses__list',
    budgetLabel: '.budget__value',
    incLabel: '.budget__income--value',
    expLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    percentageListLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type){
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    return (type === 'exp' ? '-' : '+') + int + '.' + dec;
  };

// Public method
return {

  getInputData: function(){
    return {
    type: document.querySelector(DOMsting.type).value,
    description: document.querySelector(DOMsting.description).value,
    value: parseFloat(document.querySelector(DOMsting.value).value)
    };
  },

  addTypeItem: function(obj, type){
    var html, newHtml, element;

    // Create HTML with placeholder
    if (type === 'inc'){
      element = DOMsting.incomeList;
      html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    } else if (type === 'exp'){
      element = DOMsting.expensesList;
      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    }

    // Replace placeholder with some data
    newHtml = html.replace('%id%', obj.id);
    newHtml = newHtml.replace('%description%', obj.description);
    newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

    // Update UI
    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
  },

  deleteListItem: function(itemID){
    var el = document.getElementById(itemID);
    el.parentNode.removeChild(el);
  },

  clearInput: function(){
    var input, inputArray;
    input = document.querySelectorAll(DOMsting.description + ', ' + DOMsting.value);
    inputArray = Array.prototype.slice.call(input);
    inputArray.forEach(function(el){
      el.value = '';
    });
    inputArray[0].focus();
  },

  displayBudget: function(obj){
    var type = obj.budget >= 0 ? 'inc' : 'exp';
    document.querySelector(DOMsting.budgetLabel).innerText = formatNumber(obj.budget, type);
    document.querySelector(DOMsting.incLabel).innerText = formatNumber(obj.totalInc, 'inc');
    document.querySelector(DOMsting.expLabel).innerText = formatNumber(obj.totalExp, 'exp');
    if (obj.percentage > 0){
      document.querySelector(DOMsting.percentageLabel).innerText = obj.percentage + '%';
    } else {
      document.querySelector(DOMsting.percentageLabel).innerText = '---';
    }
  },

  updatePercentage: function(obj){
    var fields = document.querySelectorAll(DOMsting.percentageListLabel);

    var nodeForEach = function(list, callback){
      for (i = 0; i < list.length; i++){
        callback(list[i], i);
      }
    };
    nodeForEach(fields, function(current, index){
      if (obj[index] > 0){
        current.innerText = obj[index] + '%';
      } else {
        current.innerText = '---';
      }
    });
  },

  displayDate: function(){
    var now, month, months, year;

    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    now = new Date();
    month = now.getMonth();
    year = now.getFullYear();

    document.querySelector(DOMsting.dateLabel).innerText = months[month] + ' ' + year;
  },

  getDOMstrings: function(){
    return DOMsting;
  }
}
})();

// ============== APP CONTROLLER ==============

var controller = (function(budgetCtrl, UICtrl){

  var setEventListener = function(){
    // Event listener for Add Item
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.add_btn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
      if (event.keyCode === 13){
        ctrlAddItem();
        event.preventDefault();
        event.stopPropagation()
      }
    });
    document.querySelector(DOM.container).addEventListener('click', deleteItem);
  };

  var updateBudget = function(){
    // Calculate the budget
    budgetCtrl.calculateBudget();

    // Getting the budget
    var budget = budgetCtrl.getBudget();

    // Display the budget to UI
    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function(){
    // Get the input data
    var input = UICtrl.getInputData();
    if (input.description !== '' && !isNaN(input.value) && input.value !== 0){

      // Add the data to budget Controller
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // Add the data to UI
      UICtrl.addTypeItem(newItem, input.type);

      // Clear inputs
      UICtrl.clearInput();

      // Update the budget
      updateBudget();

      // Update Percentage
      updatePercentage();
    }
  };

  var deleteItem = function(event){
    var itemID, type, id;

    // Retrieving the type and id to delete
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      // Delete item from Budget Controller
      budgetCtrl.deleteItem(type, id);

      // Delete HTML item
      UICtrl.deleteListItem(itemID);

      // Updating Budget
      updateBudget();

      // Update Percentage
      updatePercentage();
    }
  };

  var updatePercentage = function(){
    // Calculate percentage
    budgetCtrl.calculatePercentage();

    // Getting percentage
    var percentage = budgetCtrl.getPercentage();

    // Display Percentage to UI
    UICtrl.updatePercentage(percentage);
  };

  return {
    init: function(){
      console.log('App is running.');
      setEventListener();
      UICtrl.displayDate();
      UICtrl.displayBudget({
        totalInc: 0,
        totalExp: 0,
        budget: 0,
        percentage: -1
      });
    }
  };

})(budgetController, UIController);

controller.init();
