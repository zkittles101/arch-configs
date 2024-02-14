/*
##
##  Enhancer for YouTube™
##  =====================
##
##  Author: Maxime RF <https://www.mrfdev.com>
##
##  This file is protected by copyright laws and international copyright
##  treaties, as well as other intellectual property laws and treaties.
##
##  All rights not expressly granted to you are retained by the author.
##  Read the license.txt file for more details.
##
##  © MRFDEV.com - All Rights Reserved
##
*/
var date = new Date;
if (date.getFullYear() > 2022 || date.getMonth() > 6  || date.getMonth() === 6 && date.getDate() > 17)
	document.querySelector('.sponsor-image img').src = './resources/vendor/asphalt/A8_Centenario.jpg';