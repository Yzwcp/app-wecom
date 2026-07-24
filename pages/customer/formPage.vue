<template>
	<div class="form-page-layout">
		<aside class="form-sidebar">
			<div class="sidebar-header">
				<span class="sidebar-title">表单导航</span>
			</div>
			<nav class="sidebar-nav">
				<div
					v-for="item in navItems"
					:key="item.key"
					:class="['nav-item', { active: activeNav === item.key }]"
					@click="scrollToSection(item.key)"
				>
					<component :is="item.icon" class="nav-icon" />
					<span class="nav-label">{{ item.label }}</span>
				</div>
			</nav>
		</aside>

		<div class="form-main-wrapper">
			<main class="form-main" ref="formMainRef" @scroll="handleScroll">
				<a-form ref="formRef" :model="formData" :label-col="{ span: 4 }" label-align="left">
					<section id="section-basic" class="form-module" data-nav="basic">
						<div class="module-header">
							<idcard-outlined class="module-icon" />
							<span class="module-title">基本信息</span>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item
										label="门头名称"
										name="storeName"
										:rules="[{ required: true, message: '请输入门头名称' }]"
									>
										<a-input
											v-model:value="formData.storeName"
											placeholder="请输入门头名称"
											allow-clear
										/>
									</a-form-item>
								</a-col>
								<!--								<a-col :span="11" :offset="1">-->
								<!--									<a-form-item label="历史名称" name="historyName">-->
								<!--										<a-input-->
								<!--											v-model:value="formData.historyName"-->
								<!--											placeholder="请输入历史名称"-->
								<!--											allow-clear-->
								<!--										/>-->
								<!--									</a-form-item>-->
								<!--								</a-col>-->
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="省市区" name="areaCode" :label-col="{ span: 4 }">
										<AreaCascader ref="areaRef" v-model:area="formData.areaCode"></AreaCascader>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="详细地址" name="address" :label-col="{ span: 4 }">
										<a-textarea
											@focus="handleAddrFocus"
											v-model:value="formData.address"
											placeholder="请输入详细地址"
											:rows="2"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="高德地图经纬度" :label-col="{ span: 4 }">
										<a-space>
											<a-input
												v-model:value="formData.longitude"
												placeholder="经度"
												style="width: 150px"
												disabled
											/>
											<a-input
												v-model:value="formData.latitude"
												placeholder="纬度"
												style="width: 150px"
												disabled
											/>
											<a-button @click="mapModalRef.onOpen(formData)">
												<template #icon><environment-outlined /></template>
												{{ positionInfo.address ? positionInfo.address : '选择' }}
											</a-button>
										</a-space>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="经营状态" name="businessStatus">
										<a-select
											v-model:value="formData.businessStatus"
											placeholder="请选择经营状态"
											:options="tool.dictList('WJ_BUSINESS_STATUS')"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="类别" name="category">
										<a-select
											v-model:value="formData.category"
											placeholder="请选择类别"
											:options="tool.dictList('WJ_STORE_CATEGORY')"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="所属连锁" name="chainCode">
										<a-select
											v-model:value="formData.chainCode"
											placeholder="请选择所属连锁"
											:options="tool.dictList('WJ_CHAIN')"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="所属派出所" name="policeStation">
										<a-cascader
											:show-search="{ policefilter }"
											v-model:value="policeStationValue"
											:options="policeStationOptions"
											:field-names="{ label: 'name', value: 'code', children: 'children' }"
											placeholder="请选择所属派出所"
											:allow-clear="true"
											change-on-select
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="计费注册号" name="pubwinRegNo">
										<a-input v-model:value="formData.pubwinRegNo" placeholder="请输入计费注册号" />
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="备注" name="remark" :label-col="{ span: 4 }">
										<a-textarea
											v-model:value="formData.remark"
											placeholder="请输入备注"
											:rows="3"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
							</a-row>
						</div>
					</section>

					<section id="section-contact" class="form-module" data-nav="contact">
						<div class="module-header">
							<phone-outlined class="module-icon" />
							<span class="module-title">联系方式</span>
						</div>
						<div class="module-body">
							<div class="sub-section-header">
								<span>联系人列表（支持添加多个联系人）</span>
								<a-button type="primary" size="small" @click="addContact">
									<template #icon><plus-outlined /></template>
									添加联系人
								</a-button>
							</div>
							<a-table
								:columns="contactColumns"
								:data-source="formData.contactList"
								bordered
								:pagination="false"
							>
								<template #bodyCell="{ column, record, index }">
									<template v-if="column.dataIndex === 'contactName'">
										<a-input v-model:value="record.contactName" placeholder="请输入联系人姓名" />
									</template>
									<template v-if="column.dataIndex === 'phone'">
										<a-input v-model:value="record.phone" placeholder="请输入联系电话" />
									</template>
									<template v-if="column.dataIndex === 'remark'">
										<a-input v-model:value="record.remark" placeholder="请输入备注" />
									</template>
									<template v-if="column.dataIndex === 'action'">
										<a-button type="link" danger size="small" @click="removeContact(index)">
											<delete-outlined />删除
										</a-button>
									</template>
								</template>
							</a-table>
							<div v-if="!formData.contactList?.length" class="empty-tip">
								暂无联系人，点击上方按钮添加
							</div>
						</div>
					</section>

					<section id="section-company" class="form-module" data-nav="company">
						<div class="module-header">
							<bank-outlined class="module-icon" />
							<span class="module-title">企业信息</span>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item label="主体名称" name="companyName">
										<a-space>
											<a-input
												v-model:value="formData.companyName"
												placeholder="请输入或自动识别主体名称"
												style="width: 250px"
											/>
											<a-button
												type="link"
												@click="searchCompanyInfo"
												:disabled="!formData.companyName"
											>
												企信宝查询
											</a-button>
										</a-space>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="法人名称" name="legalPerson">
										<a-input
											v-model:value="formData.legalPerson"
											placeholder="请输入或自动识别法人名称"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="营业执照码" name="licenseNo">
										<a-input
											v-model:value="formData.licenseNo"
											placeholder="请输入或自动识别营业执照码"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="上传营业执照" :label-col="{ span: 4 }">
										<a-image
											class="mr-10"
											v-if="formData.businessLicenseUrl"
											:width="100"
											:src="formData.businessLicenseUrl"
										></a-image>
										<a-button type="link" v-if="!formData.businessLicenseUrl">
											<upload-outlined />
											<input
												style="display: none"
												id="upload"
												type="file"
												name="upload"
												@change="uploadTemplate"
											/>
											<label class="cursor-pointer" for="upload">点击上传</label>
										</a-button>
										<a-button class="ml-2" type="link" danger @click="delUrl" v-else>
											删除
										</a-button>
										<div class="upload-tip" v-if="!formData.businessLicenseUrl">
											上传后可自动识别企业信息
										</div>
									</a-form-item>
								</a-col>
							</a-row>
						</div>
					</section>

					<section id="section-pubwin" class="form-module" data-nav="pubwin">
						<div class="module-header">
							<desktop-outlined class="module-icon" />
							<span class="module-title">Pubwin 服务</span>
							<template v-for="user in getServicePersonnel('BILLING')" :key="user.userId">
								<span class="module-personnel">(业务经理:{{ user.userName }})</span>
							</template>
							<a-button class="quick-view-btn ml-5" size="small" @click="openQuickView">
								<template #icon><eye-outlined /></template>
								快速查看
							</a-button>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item label="机器台数" name="pubwinMachineCount">
										<a-input-number
											v-model:value="formData.pubwinMachineCount"
											placeholder="请输入机器台数"
											:min="0"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="年服务费" name="pubwinServiceFee">
										<a-input-number
											v-model:value="formData.pubwinServiceFee"
											placeholder="请输入年服务费"
											:min="0"
											:precision="2"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="到期开始时间" name="pubwinExpiredStartTime">
										<a-date-picker
											v-model:value="formData.pubwinExpiredStartTime"
											placeholder="请选择到期开始时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="到期时间" name="pubwinExpireTime">
										<a-date-picker
											v-model:value="formData.pubwinExpireTime"
											placeholder="请选择到期时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
							</a-row>
						</div>
					</section>

					<section id="section-maintenance" class="form-module" data-nav="maintenance">
						<div class="module-header">
							<tool-outlined class="module-icon" />
							<span class="module-title">维护服务</span>
							<template v-for="user in getServicePersonnel('MAINTENANCE')" :key="user.userId">
								<span class="module-personnel">(业务经理:{{ user.userName }})</span>
							</template>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item label="维护公司" name="maintenanceCompany">
										<a-select
											v-model:value="formData.maintenanceCompany"
											placeholder="请选择维护公司"
											:options="tool.dictList('WJ_MAINTENANCE')"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="年服务费" name="maintenanceFee">
										<a-input-number
											v-model:value="formData.maintenanceFee"
											placeholder="请输入年服务费"
											:min="0"
											:precision="2"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="到期开始时间" name="maintenanceExpiredStartTime">
										<a-date-picker
											v-model:value="formData.maintenanceExpiredStartTime"
											placeholder="请选择到期开始时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="到期时间" name="maintenanceExpireTime">
										<a-date-picker
											v-model:value="formData.maintenanceExpireTime"
											placeholder="请选择到期时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
							</a-row>
						</div>
					</section>

					<section id="section-cloud" class="form-module" data-nav="cloud">
						<div class="module-header">
							<cloud-outlined class="module-icon" />
							<span class="module-title">算力服务</span>
							<template v-for="user in getServicePersonnel('CLOUD_BOX')" :key="user.userId">
								<span class="module-personnel">(业务经理:{{ user.userName }})</span>
							</template>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item label="月服务费" name="cloudServiceFee">
										<a-input-number
											v-model:value="formData.cloudServiceFee"
											placeholder="请输入月服务费"
											:min="0"
											:precision="2"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="到期开始时间" name="cloudExpiredStartTime">
										<a-date-picker
											v-model:value="formData.cloudExpiredStartTime"
											placeholder="请选择到期开始时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="到期时间" name="cloudExpireTime">
										<a-date-picker
											v-model:value="formData.cloudExpireTime"
											placeholder="请选择到期时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
							</a-row>

							<div v-if="formData.category === 'HOTEL'" class="sub-section">
								<div class="sub-section-header">
									<span class="sub-section-title">电脑显示设备信息</span>
								</div>
								<a-table
									:columns="hotelComputerColumns"
									:data-source="hotelComputerList"
									bordered
									:pagination="false"
									size="middle"
									:loading="hotelComputerLoading"
								>
									<template #bodyCell="{ column, record }">
										<template v-if="column.dataIndex === 'deviceName'">
											<span>{{ record.deviceName || '-' }}</span>
										</template>
										<template v-if="column.dataIndex === 'cpu'">
											<span>{{ record.cpu || '-' }}</span>
										</template>
										<template v-if="column.dataIndex === 'gpu'">
											<span>{{ record.gpu || '-' }}</span>
										</template>
										<template v-if="column.dataIndex === 'memory'">
											<span>{{ record.memory || '-' }}</span>
										</template>
										<template v-if="column.dataIndex === 'ipAddress'">
											<span>{{ record.ipAddress || '-' }}</span>
										</template>
										<template v-if="column.dataIndex === 'refreshRate'">
											<span>{{ record.refreshRate || '-' }}</span>
										</template>
									</template>
								</a-table>
								<div v-if="!hotelComputerList?.length && !hotelComputerLoading" class="empty-tip">
									暂无电脑显示设备信息
								</div>
							</div>

							<div v-else class="sub-section">
								<div class="sub-section-header">
									<span class="sub-section-title">算力设备列表</span>
									<a-button type="primary" size="small" @click="addCloudDevice">
										<template #icon><plus-outlined /></template>
										添加设备
									</a-button>
								</div>
								<a-table
									:columns="cloudDeviceColumns"
									:data-source="formData.cloudDeviceList"
									bordered
									:pagination="false"
									size="middle"
								>
									<template #bodyCell="{ column, record, index }">
										<template v-if="column.dataIndex === 'deviceName'">
											<template v-if="record.id && editingCloudIndex !== index">
												<span>{{ record.deviceName || '-' }}</span>
											</template>
											<a-input
												v-else-if="editingCloudIndex === index"
												v-model:value="editingCloudRecord.deviceName"
												placeholder="设备名称"
											/>
											<a-input v-else v-model:value="record.deviceName" placeholder="设备名称" />
										</template>
										<template v-if="column.dataIndex === 'cpu'">
											<template v-if="record.id && editingCloudIndex !== index">
												<span>{{ record.cpu || '-' }}</span>
											</template>
											<a-input
												v-else-if="editingCloudIndex === index"
												v-model:value="editingCloudRecord.cpu"
												placeholder="CPU型号"
											/>
											<a-input v-else v-model:value="record.cpu" placeholder="CPU型号" />
										</template>
										<template v-if="column.dataIndex === 'gpu'">
											<template v-if="record.id && editingCloudIndex !== index">
												<span>{{ record.gpu || '-' }}</span>
											</template>
											<a-input
												v-else-if="editingCloudIndex === index"
												v-model:value="editingCloudRecord.gpu"
												placeholder="显卡型号"
											/>
											<a-input v-else v-model:value="record.gpu" placeholder="显卡型号" />
										</template>
										<template v-if="column.dataIndex === 'memory'">
											<template v-if="record.id && editingCloudIndex !== index">
												<span>{{ record.memory || '-' }}</span>
											</template>
											<a-input
												v-else-if="editingCloudIndex === index"
												v-model:value="editingCloudRecord.memory"
												placeholder="内存"
											/>
											<a-input v-else v-model:value="record.memory" placeholder="内存" />
										</template>
										<template v-if="column.dataIndex === 'ipAddress'">
											<template v-if="record.id && editingCloudIndex !== index">
												<span>{{ record.ipAddress || '-' }}</span>
											</template>
											<a-input
												v-else-if="editingCloudIndex === index"
												v-model:value="editingCloudRecord.ipAddress"
												placeholder="IP地址"
											/>
											<a-input v-else v-model:value="record.ipAddress" placeholder="IP地址" />
										</template>
										<template v-if="column.dataIndex === 'refreshRate'">
											<template v-if="record.id && editingCloudIndex !== index">
												<span>{{ record.refreshRate || '-' }}</span>
											</template>
											<a-input
												v-else-if="editingCloudIndex === index"
												v-model:value="editingCloudRecord.refreshRate"
												placeholder="显示器刷新率"
											/>
											<a-input
												v-else
												v-model:value="record.refreshRate"
												placeholder="显示器刷新率"
											/>
										</template>
										<template v-if="column.dataIndex === 'action'">
											<a-space>
												<template v-if="!record.id">
													<a-button
														type="link"
														size="small"
														@click="saveCloudDevice(record, index)"
													>
														<save-outlined />保存
													</a-button>
													<a-button
														type="link"
														danger
														size="small"
														@click="removeCloudDevice(index)"
													>
														<delete-outlined />删除
													</a-button>
												</template>
												<template v-else-if="editingCloudIndex === index">
													<a-button
														type="link"
														size="small"
														@click="saveCloudDevice(record, index)"
													>
														<save-outlined />保存
													</a-button>
													<a-button type="link" size="small" @click="cancelEditCloudDevice">
														取消
													</a-button>
												</template>
												<template v-else>
													<a-button
														type="link"
														size="small"
														@click="startEditCloudDevice(index)"
													>
														<edit-outlined />编辑
													</a-button>
													<a-button
														type="link"
														danger
														size="small"
														@click="removeCloudDevice(index)"
													>
														<delete-outlined />删除
													</a-button>
												</template>
											</a-space>
										</template>
									</template>
								</a-table>
								<div v-if="!formData.cloudDeviceList?.length" class="empty-tip">
									暂无设备，点击上方按钮添加
								</div>
							</div>
						</div>
					</section>

					<section id="section-cloud-broadband" class="form-module" data-nav="cloud-broadband">
						<div class="module-header">
							<wifi-outlined class="module-icon" />
							<span class="module-title">电竞云宽带服务</span>
							<template v-for="user in getServicePersonnel('CLOUD_BROADBAND')" :key="user.userId">
								<span class="module-personnel">(业务经理:{{ user.userName }})</span>
							</template>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item label="运营商" name="cloudBroadbandCarrier">
										<a-select
											v-model:value="formData.cloudBroadbandCarrier"
											placeholder="请选择运营商"
											:options="tool.dictList('CARRIER_CATEGORY')"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="年服务费" name="cloudBroadbandProjectFee">
										<a-input-number
											v-model:value="formData.cloudBroadbandProjectFee"
											placeholder="请输入服务费"
											:min="0"
											:precision="2"
											style="width: 100%"
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="线路编码" name="cloudBroadbandLineCode">
										<a-input
											v-model:value="formData.cloudBroadbandLineCode"
											placeholder="请输入线路编码"
											allow-clear
										/>
									</a-form-item>
								</a-col>
							</a-row>
							<a-row>
								<a-col :span="12">
									<a-form-item label="到期开始时间" name="cloudBroadbandExpiredStartTime">
										<a-date-picker
											v-model:value="formData.cloudBroadbandExpiredStartTime"
											placeholder="请选择到期开始时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="1">
									<a-form-item label="到期时间" name="cloudBroadbandExpiredTime">
										<a-date-picker
											v-model:value="formData.cloudBroadbandExpiredTime"
											placeholder="请选择到期时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
							</a-row>
						</div>
					</section>

					<section id="section-face" class="form-module" data-nav="face">
						<div class="module-header">
							<smile-outlined class="module-icon" />
							<span class="module-title">人脸设备</span>
							<template v-for="user in getServicePersonnel('FACE_DEVICE')" :key="user.userId">
								<span class="module-personnel">(业务经理:{{ user.userName }})</span>
							</template>
						</div>
						<div class="module-body">
							<a-row>
								<a-col :span="12">
									<a-form-item label="设备类型" name="faceDeviceType">
										<a-select
											v-model:value="formData.faceDeviceType"
											placeholder="请选择设备类型"
											:options="tool.dictList('WJ_FACE_DEVICE')"
											@change="handleFaceDeviceChange"
										/>
									</a-form-item>
								</a-col>
								<!-- <a-col :span="11" :offset="1">
									<a-form-item label="到期时间" name="faceExpireTime">
										<a-date-picker
											v-model:value="formData.faceExpireTime"
											placeholder="请选择到期时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col> -->
							</a-row>
							<a-row v-if="false">
								<a-col :span="12">
									<a-form-item label="到期开始时间" name="faceExpiredStartTime">
										<a-date-picker
											v-model:value="formData.faceExpiredStartTime"
											placeholder="请选择到期开始时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
								<a-col :span="11" :offset="0">
									<a-form-item label="到期时间" name="faceExpireTime">
										<a-date-picker
											v-model:value="formData.faceExpireTime"
											placeholder="请选择到期时间"
											style="width: 100%"
											value-format="YYYY-MM-DD HH:mm:ss"
											format="YYYY-MM-DD HH:mm:ss"
											:show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
										/>
									</a-form-item>
								</a-col>
							</a-row>

							<div v-if="formData.faceDeviceType === 'CS'" class="sub-section">
								<div class="sub-section-header">
									<span class="sub-section-title">辰朔自助机设备列表</span>
								</div>
								<a-table
									:columns="zzjDeviceColumns"
									:data-source="zzjDeviceList"
									bordered
									:pagination="false"
									size="middle"
									:loading="zzjLoading"
									:row-key="(record) => record.sn || record.machineId"
								/>
								<!-- <div v-if="!zzjDeviceList?.length && !zzjLoading" class="empty-tip">
									暂无辰朔自助机设备信息
								</div> -->
							</div>
						</div>
					</section>
				</a-form>
			</main>
			<div class="form-actions">
				<a-button size="large" @click="resetForm">重置表单</a-button>

				<a-button size="large" type="primary" @click="submitAll">保存全部信息</a-button>
			</div>
		</div>
	</div>

	<PositionModal @getPositionInfo="getPositionInfo" ref="mapModalRef"></PositionModal>

	<a-drawer
		title="快捷信息速览"
		:visible="quickViewVisible"
		placement="right"
		:width="620"
		@close="quickViewVisible = false"
	>
		<a-descriptions :column="1" bordered size="small">
			<a-descriptions-item label="主体名称">
				{{ formData.companyName || '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="地址">
				{{ formData.address || '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="类别">
				{{ tool.dictTypeData('WJ_STORE_CATEGORY', formData.category) }}
			</a-descriptions-item>
			<a-descriptions-item label="所属连锁">
				{{ tool.dictTypeData('WJ_CHAIN', formData.chainCode) }}
			</a-descriptions-item>
			<a-descriptions-item label="网维公司">
				{{ tool.dictTypeData('WJ_MAINTENANCE', formData.maintenanceCompany) }}
			</a-descriptions-item>
			<a-descriptions-item label="计费注册号">
				<span style="color: red">{{ formData.pubwinRegNo || '-' }}</span>
			</a-descriptions-item>
			<a-descriptions-item label="Pubwin到期开始时间">
				{{ formData.pubwinExpiredStartTime || '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="Pubwin到期时间">
				{{ formData.pubwinExpireTime || '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="Pubwin年服务费">
				{{ formData.pubwinServiceFee != null ? '¥' + formData.pubwinServiceFee : '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="Pubwin机器台数">
				{{ formData.pubwinMachineCount != null ? formData.pubwinMachineCount + '台' : '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="人脸设备">
				{{ tool.dictTypeData('WJ_FACE_DEVICE', formData.faceDeviceType) }}
			</a-descriptions-item>
		</a-descriptions>
	</a-drawer>
</template>

<script setup name="BizCompanyCustomerFormPage_No_KeepLive">
import { message } from 'ant-design-vue'
import {
	PlusOutlined,
	DeleteOutlined,
	SaveOutlined,
	EditOutlined,
	MinusCircleOutlined,
	IdcardOutlined,
	PhoneOutlined,
	BankOutlined,
	DesktopOutlined,
	ToolOutlined,
	CloudOutlined,
	WifiOutlined,
	SmileOutlined,
	EyeOutlined
} from '@ant-design/icons-vue'
import tool from '@/utils/tool'
import CardUpload from '@/components/Business/CardUpload.vue'
import bizWjApi from '@/api/biz/bizWjApi'
import bizStorePlaceApi from '@/api/biz/bizStorePlaceApi'
import AreaCascader from '@/components/Business/AreaCascader.vue'
import PositionModal from '@/views/internet/acc/store/components/positionModal.vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import bookingApi from '@/api/internet/bookingApi'
import policeStationRaw from './policeStation.json'
const route = useRoute()

const positionModalRef = ref()
const licenseUploadRef = ref()
const positionInfo = ref({})
const mapModalRef = ref()
const formMainRef = ref()
const areaRef = ref()
const activeNav = ref('basic')
const editingCloudIndex = ref(-1)
const editingCloudRecord = ref({})
const policeStationValue = ref([])
const quickViewVisible = ref(false)

const policeStationOptions = computed(() =>
	Object.entries(policeStationRaw).map(([district, stations]) => ({
		name: district,
		code: district,
		children: stations.map((station) => ({
			name: station,
			code: station
		}))
	}))
)
let isManualScrolling = false
let scrollTimer = null

const navItems = [
	{ key: 'basic', label: '基本信息', icon: 'IdcardOutlined' },
	{ key: 'contact', label: '联系方式', icon: 'PhoneOutlined' },
	{ key: 'company', label: '企业信息', icon: 'BankOutlined' },
	{ key: 'pubwin', label: 'Pubwin 服务', icon: 'DesktopOutlined' },
	{ key: 'maintenance', label: '维护服务', icon: 'ToolOutlined' },
	{ key: 'cloud', label: '算力服务', icon: 'CloudOutlined' },
	{ key: 'cloud-broadband', label: '电竞云宽带服务', icon: 'WifiOutlined' },
	{ key: 'face', label: '人脸设备', icon: 'SmileOutlined' }
]

let formData = $ref({
	id: undefined,
	storeName: '',
	historyName: '',
	areaCode: {},
	address: '',
	longitude: '',
	latitude: '',
	businessStatus: undefined,
	category: undefined,
	chainCode: undefined,
	policeStation: '',
	remark: '',
	pubwinRegNo: '',
	contactList: [{ contactName: '', phone: '' }],
	companyName: '',
	legalPerson: '',
	licenseNo: '',
	licenseFileIds: [],
	pubwinMachineCount: undefined,
	pubwinServiceFee: undefined,
	pubwinExpireTime: undefined,
	pubwinExpiredStartTime: undefined,
	maintenanceCompany: undefined,
	maintenanceFee: undefined,
	maintenanceExpireTime: undefined,
	maintenanceExpiredStartTime: undefined,
	cloudServiceFee: undefined,
	cloudExpireTime: undefined,
	cloudExpiredStartTime: undefined,
	cloudDeviceList: [],
	cloudBroadbandCarrier: undefined,
	cloudBroadbandProjectFee: undefined,
	cloudBroadbandLineCode: '',
	cloudBroadbandExpiredTime: undefined,
	cloudBroadbandExpiredStartTime: undefined,
	cloudBroadbandServiceId: undefined,
	faceDeviceType: undefined,
	faceExpireTime: undefined,
	faceExpiredStartTime: undefined,
	faceDeviceList: [],
	billingServiceId: undefined,
	maintenanceServiceId: undefined,
	cloudServiceId: undefined,
	faceServiceId: undefined,
	businessLicenseUrl: ''
})

const areaOptions = ref([])
const chainList = ref([])
const maintenanceCompanies = ref([])
const delUrl = () => {
	formData.businessLicenseUrl = ''
}

const uploadTemplate = async (event) => {
	const hide = message.loading('上传中...', 0)
	try {
		const file = event.target.files[0]
		const formFileData = new FormData()
		formFileData.append('file', file)
		event.target.value = null
		let data = await bizWjApi.wjStoreOcr(formFileData)
		console.log(data)
		if (data) {
			// {
			// 	"legalPerson": "谭宏亮",
			// 	"businessLicenseCode": "913301057735974516",
			// 	"subjectName": "杭州网晶科技有限公司"
			// }
			formData.companyName = data.subjectName
			formData.licenseNo = data.businessLicenseCode
			formData.legalPerson = data.legalPerson
			formData.businessLicenseUrl = data.businessLicenseUrl
		}
		hide()
	} catch (err) {
		hide()
	}
}
function loadDetail() {
	const storeId = route.query.id
	if (!storeId) return

	bizWjApi.wjStoreDetail({ id: storeId }).then((res) => {
		const store = res.store || {}
		const contactList = res.contactList || []
		const enterprise = res.enterprise || {}
		const serviceList = res.serviceList || []
		servicePersonnelList.value = res.serviceUserList || []

		const areaCode = {}
		if (store.provinceCode) areaCode.provCode = store.provinceCode
		if (store.provinceName || store.province) areaCode.province = store.provinceName || store.province
		if (store.cityCode) areaCode.cityCode = store.cityCode
		if (store.cityName || store.city) areaCode.city = store.cityName || store.city
		if (store.districtCode) areaCode.countyCode = store.districtCode
		if (store.districtName || store.district) areaCode.county = store.districtName || store.district

		let pubwinMachineCount, pubwinServiceFee, pubwinExpireTime, pubwinExpiredStartTime, billingServiceId
		let maintenanceCompany, maintenanceFee, maintenanceExpireTime, maintenanceExpiredStartTime, maintenanceServiceId
		let cloudServiceFee, cloudExpireTime, cloudExpiredStartTime, cloudServiceId
		let cloudBroadbandCarrier,
			cloudBroadbandProjectFee,
			cloudBroadbandLineCode,
			cloudBroadbandExpiredTime,
			cloudBroadbandExpiredStartTime,
			cloudBroadbandServiceId
		let faceDeviceType, faceExpireTime, faceExpiredStartTime, faceServiceId

		serviceList.forEach((item) => {
			switch (item.serviceType) {
				case 'BILLING':
					billingServiceId = item.id
					pubwinMachineCount = item.machineCount
					pubwinServiceFee = item.projectFee
					pubwinExpireTime = item.expiredTime
					pubwinExpiredStartTime = item.expiredStartTime
					break
				case 'MAINTENANCE':
					maintenanceServiceId = item.id
					maintenanceCompany = item.maintenanceCompany
					maintenanceFee = item.projectFee
					maintenanceExpireTime = item.expiredTime
					maintenanceExpiredStartTime = item.expiredStartTime
					break
				case 'CLOUD_BOX':
					cloudServiceId = item.id
					cloudServiceFee = item.projectFee
					cloudExpireTime = item.expiredTime
					cloudExpiredStartTime = item.expiredStartTime
					break
				case 'CLOUD_BROADBAND':
					cloudBroadbandServiceId = item.id
					cloudBroadbandCarrier = item.carrier
					cloudBroadbandProjectFee = item.projectFee
					cloudBroadbandLineCode = item.lineCode
					cloudBroadbandExpiredTime = item.expiredTime
					cloudBroadbandExpiredStartTime = item.expiredStartTime
					break
				case 'FACE_DEVICE':
					faceServiceId = item.id
					faceDeviceType = item.faceDeviceType
					faceExpireTime = item.expiredTime
					faceExpiredStartTime = item.expiredStartTime
					break
			}
		})

		if (areaCode.provCode) {
			areaRef.value.setValue([areaCode.provCode, areaCode.cityCode, areaCode.countyCode])
		}
		formData = {
			id: store.id || undefined,
			storeName: store.storeName || '',
			historyName: store.historyName || '',
			areaCode,
			address: store.address || '',
			longitude: store.longitude ? String(store.longitude) : '',
			latitude: store.latitude ? String(store.latitude) : '',
			businessStatus: store.businessStatus,
			category: store.category,
			chainCode: store.chainCode || undefined,
			policeStation: store.policeStation || '',
			remark: store.remark || '',
			pubwinRegNo: store.pubwinId || '',
			contactList: contactList.length
				? contactList.map((c) => ({
						id: c.id,
						contactName: c.contactName || '',
						phone: c.contactPhone || '',
						remark: c.remark || ''
				  }))
				: [{ contactName: '', phone: '', remark: '' }],
			companyName: enterprise.subjectName || '',
			legalPerson: enterprise.legalPerson || '',
			licenseNo: enterprise.businessLicenseCode || '',
			pubwinMachineCount,
			pubwinServiceFee,
			pubwinExpireTime,
			pubwinExpiredStartTime,
			maintenanceCompany,
			maintenanceFee,
			maintenanceExpireTime,
			maintenanceExpiredStartTime,
			cloudServiceFee,
			cloudExpireTime,
			cloudExpiredStartTime,
			cloudDeviceList: [],
			cloudBroadbandCarrier,
			cloudBroadbandProjectFee,
			cloudBroadbandLineCode,
			cloudBroadbandExpiredTime,
			cloudBroadbandExpiredStartTime,
			cloudBroadbandServiceId,
			faceDeviceType,
			faceExpireTime,
			faceExpiredStartTime,
			faceDeviceList: [],
			billingServiceId,
			maintenanceServiceId,
			cloudServiceId,
			faceServiceId,
			businessLicenseUrl: enterprise.businessLicenseUrl || ''
		}

		// 回填派出所cascader值
		if (store.policeStation) {
			const stationName = store.policeStation
			for (const [district, stations] of Object.entries(policeStationRaw)) {
				if (stations.includes(stationName)) {
					policeStationValue.value = [district, stationName]
					break
				}
			}
		}

		if (store.id) {
			fetchCloudDeviceList()
		}

		if (store.category === 'HOTEL' && store.id) {
			fetchHotelComputerList()
		}
	})
}

const policefilter = (inputValue, path) => {
	return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
}

function handleAddrFocus() {
	console.log(formData.address)

	if (formData.address || !formData.areaCode.province) return
	let s = ''
	if (formData.areaCode.province) s += formData.areaCode.province
	if (formData.areaCode.city) s += formData.areaCode.city
	if (formData.areaCode.county) s += formData.areaCode.county
	formData.address = s
}

function getPositionInfo(data) {
	positionInfo.value = data
	formData.longitude = data.position.lng.toString()
	formData.latitude = data.position.lat.toString()
}

const contactColumns = [
	{ title: '序号', dataIndex: 'index', width: 80, customRender: ({ index }) => index + 1 },
	{ title: '联系人', dataIndex: 'contactName', width: 200 },
	{ title: '联系电话', dataIndex: 'phone', width: 200 },
	{ title: '备注', dataIndex: 'remark', width: 200 },
	{ title: '操作', dataIndex: 'action', width: 100 }
]

const cloudDeviceColumns = [
	{ title: '设备名称', dataIndex: 'deviceName', width: 150 },
	{ title: 'CPU型号', dataIndex: 'cpu', width: 150 },
	{ title: '显卡型号', dataIndex: 'gpu', width: 150 },
	{ title: '内存', dataIndex: 'memory', width: 100 },
	{ title: 'IP地址', dataIndex: 'ipAddress', width: 150 },
	{ title: '显示器刷新率', dataIndex: 'refreshRate', width: 130 },
	{ title: '操作', dataIndex: 'action', width: 130 }
]

const faceDeviceColumns = [
	{ title: '机器IP', dataIndex: 'machineIp', width: 150 },
	{ title: 'SN号', dataIndex: 'snNumber', width: 150 },
	{ title: '机器类型', dataIndex: 'machineType', width: 120 },
	{ title: '机器版本', dataIndex: 'machineVersion', width: 120 },
	{ title: '注册时间', dataIndex: 'registerTime', width: 150 },
	{ title: '到期时间', dataIndex: 'expireTime', width: 150 },
	{ title: '操作', dataIndex: 'action', width: 80 }
]

const hotelComputerColumns = [
	{ title: '设备名称', dataIndex: 'deviceName', width: 150 },
	{ title: 'CPU型号', dataIndex: 'cpu', width: 150 },
	{ title: '显卡型号', dataIndex: 'gpu', width: 150 },
	{ title: '内存', dataIndex: 'memory', width: 100 },
	{ title: 'IP地址', dataIndex: 'ipAddress', width: 150 },
	{ title: '显示器刷新率', dataIndex: 'refreshRate', width: 130 }
]

const hotelComputerList = ref([])
const hotelComputerLoading = ref(false)

// 辰朔自助机设备列表
const zzjDeviceList = ref([])
const zzjLoading = ref(false)

// 服务模块负责人员
const servicePersonnelList = ref([])

// 根据服务类型获取负责人员
const getServicePersonnel = (serviceType) => {
	const item = servicePersonnelList.value.find((p) => p.serviceType === serviceType)
	return item?.userList || []
}

const zzjDeviceColumns = [
	{ title: 'Pubwin ID', dataIndex: 'pubwinId', width: 150 },
	{ title: '本地IP', dataIndex: 'localIp', width: 140 },
	{
		title: '类别',
		dataIndex: 'category',
		width: 100,
		customRender: (row) => tool.dictTypeData('OPEN_TYPE', row?.record?.category)
	},
	{ title: 'SN号', dataIndex: 'sn', width: 180 },
	{ title: '机器ID', dataIndex: 'machineId', width: 160 },
	{ title: '版本', dataIndex: 'version', width: 120 },
	{ title: '注册时间', dataIndex: 'registerTime', width: 170 },
	{ title: '到期时间', dataIndex: 'expiredTime', width: 170 }
]

const scrollToSection = (key) => {
	activeNav.value = key
	isManualScrolling = true
	clearTimeout(scrollTimer)
	scrollTimer = setTimeout(() => {
		isManualScrolling = false
	}, 600)

	const el = document.getElementById(`section-${key}`)
	if (el) {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
}

const handleScroll = () => {
	if (isManualScrolling) return

	const mainEl = formMainRef.value
	if (!mainEl) return
	const scrollTop = mainEl.scrollTop + 80

	const sections = mainEl.querySelectorAll('.form-module')
	let currentKey = 'basic'

	sections.forEach((section) => {
		const top = section.offsetTop
		if (scrollTop >= top) {
			currentKey = section.dataset.nav
		}
	})

	activeNav.value = currentKey
}

const openMapModal = () => {
	positionModalRef.value.onOpen({
		longitude: formData.longitude,
		latitude: formData.latitude
	})
}

const handlePositionInfo = (info) => {
	formData.longitude = info.position.lng.toString()
	formData.latitude = info.position.lat.toString()
	if (!formData.address && info.address) {
		formData.address = info.address
	}
}

const addContact = () => {
	if (!formData.contactList) {
		formData.contactList = []
	}
	formData.contactList.push({ contactName: '', phone: '', remark: '' })
}

const removeContact = (index) => {
	const item = formData.contactList[index]
	if (item.id) {
		bizWjApi.wjStoreContactRemove({ id: item.id }).then(() => {
			formData.contactList.splice(index, 1)
			message.success('联系人删除成功')
		})
	} else {
		formData.contactList.splice(index, 1)
	}
}

const searchCompanyInfo = () => {
	if (formData.companyName) {
		window.open(`https://www.qixin.com/search?key=${encodeURIComponent(formData.companyName)}`, '_blank')
	}
}

const openQuickView = () => {
	quickViewVisible.value = true
}

const addCloudDevice = () => {
	editingCloudIndex.value = -1
	if (!formData.cloudDeviceList) {
		formData.cloudDeviceList = []
	}
	formData.cloudDeviceList.push({
		deviceName: '',
		cpu: '',
		gpu: '',
		memory: '',
		ipAddress: '',
		refreshRate: ''
	})
}

const fetchCloudDeviceList = () => {
	const storeId = route.query.id
	if (!storeId) return
	bizWjApi.storeDevicePage({ storeId }).then((data) => {
		const records = data.records || data || []
		formData.cloudDeviceList = records.map((d) => ({
			id: d.id,
			deviceName: d.deviceName || '',
			cpu: d.cpu || '',
			gpu: d.gpu || '',
			memory: d.memory || '',
			ipAddress: d.ipAddress || '',
			refreshRate: d.refreshRate || ''
		}))
		editingCloudIndex.value = -1
	})
}

const startEditCloudDevice = (index) => {
	editingCloudIndex.value = index
	editingCloudRecord.value = { ...formData.cloudDeviceList[index] }
}

const cancelEditCloudDevice = () => {
	editingCloudIndex.value = -1
	editingCloudRecord.value = {}
}

const saveCloudDevice = (item, index) => {
	const storeId = route.query.id
	const source = item.id ? editingCloudRecord.value : item
	const params = {
		deviceName: source.deviceName,
		cpu: source.cpu,
		gpu: source.gpu,
		memory: source.memory,
		ipAddress: source.ipAddress,
		refreshRate: source.refreshRate,
		storeId
	}
	if (item.id) {
		bizWjApi.storeDeviceEdit({ ...params, id: item.id }).then(() => {
			fetchCloudDeviceList()
			message.success('设备保存成功')
		})
	} else {
		bizWjApi.storeDeviceAdd(params).then(() => {
			fetchCloudDeviceList()
			message.success('设备添加成功')
		})
	}
}

const removeCloudDevice = (index) => {
	const item = formData.cloudDeviceList[index]
	if (item.id) {
		bizWjApi.storeDeviceRemove({ id: item.id }).then(() => {
			editingCloudIndex.value = -1
			fetchCloudDeviceList()
			message.success('设备删除成功')
		})
	} else {
		formData.cloudDeviceList.splice(index, 1)
		editingCloudIndex.value = -1
	}
}

const addFaceDevice = () => {
	if (!formData.faceDeviceList) {
		formData.faceDeviceList = []
	}
	formData.faceDeviceList.push({
		machineIp: '',
		snNumber: '',
		machineType: undefined,
		machineVersion: '',
		registerTime: undefined,
		expireTime: undefined
	})
}

const removeFaceDevice = (index) => {
	formData.faceDeviceList.splice(index, 1)
}

const handleFaceDeviceChange = (value) => {
	if (value !== 'chenshuo') {
		formData.faceDeviceList = []
	}
}

const buildSubmitData = () => {
	const areaCode = formData.areaCode || {}
	const provinceCode = areaCode.provCode || ''
	const cityCode = areaCode.cityCode || ''
	const districtCode = areaCode.countyCode || ''
	const provinceName = areaCode.province || ''
	const cityName = areaCode.city || ''
	const districtName = areaCode.county || ''
	const serviceList = []

	serviceList.push({
		id: formData.billingServiceId || '',
		serviceType: 'BILLING',
		projectFee: formData.pubwinServiceFee ?? 0,
		machineCount: formData.pubwinMachineCount ?? '',
		expiredStartTime: formData.pubwinExpiredStartTime || '',
		expiredTime: formData.pubwinExpireTime || ''
	})

	serviceList.push({
		id: formData.maintenanceServiceId || '',
		serviceType: 'MAINTENANCE',
		maintenanceCompany: formData.maintenanceCompany || '',
		projectFee: formData.maintenanceFee ?? 0,
		expiredStartTime: formData.maintenanceExpiredStartTime || '',
		expiredTime: formData.maintenanceExpireTime || ''
	})

	serviceList.push({
		id: formData.cloudServiceId || '',
		serviceType: 'CLOUD_BOX',
		projectFee: formData.cloudServiceFee ?? 0,
		expiredStartTime: formData.cloudExpiredStartTime || '',
		expiredTime: formData.cloudExpireTime || ''
	})

	serviceList.push({
		id: formData.cloudBroadbandServiceId || '',
		serviceType: 'CLOUD_BROADBAND',
		carrier: formData.cloudBroadbandCarrier || '',
		projectFee: formData.cloudBroadbandProjectFee ?? 0,
		lineCode: formData.cloudBroadbandLineCode || '',
		expiredStartTime: formData.cloudBroadbandExpiredStartTime || '',
		expiredTime: formData.cloudBroadbandExpiredTime || ''
	})

	serviceList.push({
		id: formData.faceServiceId || '',
		serviceType: 'FACE_DEVICE',
		faceDeviceType: formData.faceDeviceType || '',
		projectFee: formData.faceServiceFee ?? 0,
		expiredStartTime: formData.faceExpiredStartTime || '',
		expiredTime: formData.faceExpireTime || ''
	})

	const contactList = (formData.contactList || [])
		.filter((item) => item.contactName || item.phone)
		.map((item) => ({
			id: item.id,
			contactName: item.contactName,
			contactPhone: item.phone,
			remark: item.remark || ''
		}))

	const enterprise = {
		...formData.enterprise,
		subjectName: formData.companyName || '',
		legalPerson: formData.legalPerson || '',
		businessLicenseCode: formData.licenseNo || '',
		businessLicenseUrl: formData.businessLicenseUrl || ''
	}

	// 从cascader取值转为policeStation字符串
	formData.policeStation = policeStationValue.value?.length
		? policeStationValue.value[policeStationValue.value.length - 1]
		: ''

	return {
		storeName: formData.storeName,
		historyName: formData.historyName || '',
		address: formData.address,
		longitude: formData.longitude ? parseFloat(formData.longitude) : '',
		latitude: formData.latitude ? parseFloat(formData.latitude) : '',
		businessStatus: formData.businessStatus,
		category: formData.category,
		chainCode: formData.chainCode || '',
		provinceCode,
		cityCode,
		districtCode,
		policeStation: formData.policeStation || '',
		pubwinId: formData.pubwinRegNo || '',
		remark: formData.remark || '',
		contactList: contactList.length > 0 ? contactList : [],
		enterprise,
		serviceList: serviceList.length > 0 ? serviceList : '',
		provinceName,
		cityName,
		districtName,
		id: route.query.id ? route.query.id : ''
	}
}

const submitAll = async () => {
	try {
		const submitData = buildSubmitData()
		await bizWjApi[route.query.id ? 'wjStoreEdit' : 'wjStoreAdd'](submitData)
		loadDetail()
	} catch (error) {
		message.error(error?.message || '保存失败')
	}
}

const resetForm = () => {
	formData = {
		id: route.query.id || undefined,
		storeName: '',
		historyName: '',
		areaCode: [],
		address: '',
		longitude: '',
		latitude: '',
		businessStatus: undefined,
		category: undefined,
		chainCode: undefined,
		policeStation: '',
		remark: '',
		pubwinRegNo: '',
		contactList: [{ contactName: '', phone: '', remark: '' }],
		companyName: '',
		legalPerson: '',
		licenseNo: '',
		pubwinMachineCount: undefined,
		pubwinServiceFee: undefined,
		pubwinExpireTime: undefined,
		pubwinExpiredStartTime: undefined,
		maintenanceCompany: undefined,
		maintenanceFee: undefined,
		maintenanceExpireTime: undefined,
		maintenanceExpiredStartTime: undefined,
		cloudServiceFee: undefined,
		cloudExpireTime: undefined,
		cloudExpiredStartTime: undefined,
		cloudDeviceList: [],
		cloudBroadbandCarrier: undefined,
		cloudBroadbandProjectFee: undefined,
		cloudBroadbandLineCode: '',
		cloudBroadbandExpiredTime: undefined,
		cloudBroadbandExpiredStartTime: undefined,
		cloudBroadbandServiceId: undefined,
		faceDeviceType: undefined,
		faceExpireTime: undefined,
		faceExpiredStartTime: undefined,
		faceDeviceList: [],
		billingServiceId: undefined,
		maintenanceServiceId: undefined,
		cloudServiceId: undefined,
		faceServiceId: undefined
	}
	policeStationValue.value = []
	activeNav.value = 'basic'
	formMainRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
	message.success('表单已重置')
}

const fetchHotelComputerList = async () => {
	hotelComputerLoading.value = true
	try {
		const data = await bizStorePlaceApi.comList({ storeId: formData.id })
		hotelComputerList.value = data || []
	} catch (error) {
		console.error('获取酒店电脑显示设备信息失败:', error)
		hotelComputerList.value = []
	} finally {
		hotelComputerLoading.value = false
	}
}

// 获取辰朔自助机设备列表
const fetchZzjDeviceList = async () => {
	if (!formData.pubwinRegNo) {
		zzjDeviceList.value = []
		return
	}
	zzjLoading.value = true
	try {
		const data = await bizWjApi.wjStoreZzjList({ pubwinId: formData.pubwinRegNo })
		zzjDeviceList.value = data?.list || []
	} catch (error) {
		console.error('获取辰朔自助机设备列表失败:', error)
		zzjDeviceList.value = []
	} finally {
		zzjLoading.value = false
	}
}

watch(
	() => formData.category,
	(newVal) => {
		if (newVal === 'HOTEL' && formData.id) {
			fetchHotelComputerList()
		}
	}
)

watch(
	() => formData.faceDeviceType,
	(newVal) => {
		if (newVal === 'CS') {
			fetchZzjDeviceList()
		} else {
			zzjDeviceList.value = []
		}
	}
)

onMounted(() => {
	loadDetail()
})
</script>

<style lang="less" scoped>
.form-page-layout {
	display: flex;
	height: calc(100%);
	background: #f5f6fa;
}

.form-sidebar {
	width: 200px;
	flex-shrink: 0;
	background: #fff;
	border-right: 1px solid #e8e8e8;
	padding: 24px 0;
	position: sticky;
	top: 0;
	height: calc(100%);
	overflow-y: auto;
	z-index: 10;
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);

	.sidebar-header {
		padding: 0 20px 20px;
		border-bottom: 1px solid #f0f0f0;
		margin-bottom: 8px;

		.sidebar-title {
			font-size: 16px;
			font-weight: 600;
			color: #1a1a2e;
			letter-spacing: 1px;
		}
	}

	.sidebar-nav {
		padding: 4px 12px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		margin: 2px 0;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		color: #555;
		font-size: 14px;
		position: relative;

		.nav-icon {
			font-size: 18px;
			margin-right: 12px;
			transition: transform 0.25s ease;
		}

		.nav-label {
			white-space: nowrap;
		}

		&:hover {
			background: #f0f5ff;
			color: #1890ff;
			transform: translateX(4px);

			.nav-icon {
				transform: scale(1.1);
			}
		}

		&.active {
			background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
			color: #1890ff;
			font-weight: 600;
			box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 3px;
				height: 24px;
				background: #1890ff;
				border-radius: 0 2px 2px 0;
			}
		}
	}
}

.form-main-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.form-main {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	scroll-behavior: smooth;
	padding: 10px;
}

.form-module {
	background: #fff;
	border-radius: 12px;
	margin-bottom: 20px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
	border: 1px solid #f0f0f0;
	transition: box-shadow 0.3s ease, transform 0.3s ease;
	opacity: 0;
	transform: translateY(20px);
	animation: fadeInUp 0.5s ease forwards;

	&:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}

	.module-header {
		display: flex;
		align-items: center;
		padding: 16px 24px;
		border-bottom: 1px solid #f5f5f5;
		background: linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%);
		border-radius: 12px 12px 0 0;

		.module-icon {
			font-size: 20px;
			color: #1890ff;
			margin-right: 10px;
		}

		.module-title {
			font-size: 16px;
			font-weight: 600;
			color: #1a1a2e;
		}

		.module-personnel {
			margin-left: 12px;
			font-size: 13px;
			color: #52c41a;
			font-weight: normal;
		}
	}

	.module-body {
		padding: 24px;
	}
}

@keyframes fadeInUp {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.form-module:nth-child(1) {
	animation-delay: 0.05s;
}
.form-module:nth-child(2) {
	animation-delay: 0.1s;
}
.form-module:nth-child(3) {
	animation-delay: 0.15s;
}
.form-module:nth-child(4) {
	animation-delay: 0.2s;
}
.form-module:nth-child(5) {
	animation-delay: 0.25s;
}
.form-module:nth-child(6) {
	animation-delay: 0.3s;
}
.form-module:nth-child(7) {
	animation-delay: 0.35s;
}
.form-module:nth-child(8) {
	animation-delay: 0.4s;
}

:deep(.ant-input-number),
:deep(.ant-select) {
	width: 100%;
}

.sub-section {
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid #f0f0f0;

	.sub-section-title {
		font-size: 14px;
		font-weight: 500;
		color: #1890ff;
	}

	.sub-section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;

		.sub-section-title {
			margin-bottom: 0;
		}
	}

	.empty-tip {
		text-align: center;
		color: #999;
		padding: 32px 0;
	}
}

.empty-tip {
	text-align: center;
	color: #999;
	padding: 32px 0;
}

.sub-section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.upload-tip {
	color: #ff4c4c;
	margin-top: 8px;
	font-size: 12px;
}

.form-actions {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 16px;
	padding: 12px 0;
	background: #fff;
	border-top: 1px solid #f0f0f0;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
	z-index: 20;
}
</style>
