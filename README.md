Salesforce Sim Domain Customizations
===================================

These are customizations used in our demo environment that tech sales uses.

Pages
----------
**MyInteractions**  
Page which will display a list of the user's interaction history.  Requires the MyInteractionsController

**MyInteractionsSidebar**
A variation on MyInteractions which allows the interactions to be shown in the left sidebar of the Sales Cloud

**SidebarCaseSummary**  
Used in the Case layout in the Service Cloud Console.  This will show stats for case age, if it is closed, how many activities there have been and the source of the case.

**SidebarInteractionsPage**  
Another page used in the Case layout.  This will show the interaction history related to the case.

**Workgroup_Statistics**  
This is designed to be a custom console component that shows workgroup statistics and alert levels.  It uses the open source project https://github.com/InteractiveIntelligence/StatisticsWrapper to serve up the statistics.  Before using this page, you need to update the line that points to the StatisticsWrapper service

        var statServiceUrl = "https://UPDATE YOUR SERVER HERE/workgroupstatistics";
